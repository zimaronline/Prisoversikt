import type { OcrApiReceiptResponse } from '../models/ocrApi';
import type { ParsedReceiptResult } from '../models/parser';
import type { ReceiptItem } from '../models/receiptItem';

const MOCK_ENABLED = process.env.EXPO_PUBLIC_ENABLE_MOCK_PARSER !== 'false';
const OCR_API_URL = process.env.EXPO_PUBLIC_OCR_API_URL;

export async function parseReceiptFromImage(
  imageUri: string
): Promise<ParsedReceiptResult> {
  if (MOCK_ENABLED) {
    return parseReceiptMock(imageUri);
  }

  if (!OCR_API_URL) {
    throw new Error(
      'Mangler EXPO_PUBLIC_OCR_API_URL. Sett miljøvariabel eller slå på mock-parser.'
    );
  }

  return parseReceiptViaBackend(imageUri);
}

async function parseReceiptMock(
  imageUri: string
): Promise<ParsedReceiptResult> {
  await delay(500);

  return {
    merchantName: 'KIWI',
    merchantAddress: 'Storgata 12, 4632 Kristiansand',
    purchaseDate: '2026-03-14',
    subtotal: 116.7,
    total: 145.9,
    vatTotal: 29.2,
    currency: 'NOK',
    imageUri,
    rawOcrResponse: JSON.stringify(
      {
        source: 'mock',
        merchant_name: 'KIWI',
        purchase_date: '2026-03-14',
        total: 145.9,
      },
      null,
      2
    ),
    parseConfidence: 0.82,
    items: [
      createReceiptItem({
        rawText: 'BANAN 1,2 KG 29,90',
        normalizedName: 'Banan',
        quantity: 1.2,
        unit: 'kg',
        sizeValue: null,
        sizeUnit: null,
        unitPrice: 24.92,
        lineTotal: 29.9,
        discount: 0,
        confidence: 0.82,
      }),
      createReceiptItem({
        rawText: 'LETTMELK 1L 24,90',
        normalizedName: 'Lettmelk',
        quantity: 1,
        unit: 'stk',
        sizeValue: 1,
        sizeUnit: 'L',
        unitPrice: 24.9,
        lineTotal: 24.9,
        discount: 0,
        confidence: 0.84,
      }),
      createReceiptItem({
        rawText: 'GROVT BRØD 39,90',
        normalizedName: 'Grovt brød',
        quantity: 1,
        unit: 'stk',
        sizeValue: null,
        sizeUnit: null,
        unitPrice: 39.9,
        lineTotal: 39.9,
        discount: 0,
        confidence: 0.79,
      }),
    ],
  };
}

async function parseReceiptViaBackend(
  imageUri: string
): Promise<ParsedReceiptResult> {
  const formData = new FormData();

  formData.append(
    'receiptImage',
    {
      uri: imageUri,
      name: createFileName(imageUri),
      type: guessMimeType(imageUri),
    } as any
  );

  const response = await fetch(OCR_API_URL as string, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await safeReadText(response);
    throw new Error(
      `OCR-kall feilet med status ${response.status}${errorText ? `: ${errorText}` : ''}`
    );
  }

  const payload = (await response.json()) as OcrApiReceiptResponse;
  return mapBackendResponse(payload, imageUri);
}

function mapBackendResponse(
  payload: OcrApiReceiptResponse,
  imageUri: string
): ParsedReceiptResult {
  return {
    merchantName: payload.merchantName?.trim() || '',
    merchantAddress: payload.merchantAddress?.trim() || null,
    purchaseDate: normalizeDate(payload.purchaseDate ?? ''),
    subtotal: payload.subtotal ?? null,
    total: payload.total ?? 0,
    vatTotal: payload.vatTotal ?? null,
    currency: payload.currency?.trim() || 'NOK',
    imageUri,
    rawOcrResponse: JSON.stringify(payload),
    parseConfidence: payload.parseConfidence ?? null,
    items: payload.items.map((item) =>
      createReceiptItem({
        rawText: item.rawText ?? null,
        normalizedName: item.normalizedName?.trim() || '',
        quantity: item.quantity ?? null,
        unit: item.unit ?? null,
        sizeValue: item.sizeValue ?? null,
        sizeUnit: item.sizeUnit ?? null,
        unitPrice: item.unitPrice ?? null,
        lineTotal: item.lineTotal ?? 0,
        discount: item.discount ?? null,
        confidence: item.confidence ?? null,
      })
    ),
  };
}

function mapBackendItem(item: unknown): ReceiptItem {
  const source = asRecord(item);

  return createReceiptItem({
    rawText: readString(source.rawText, source.raw_text, null) ?? null,
    normalizedName:
      readString(
        source.normalizedName,
        source.normalized_name,
        source.name,
        source.description,
        ''
      ) || '',
    quantity: readNumber(source.quantity, null),
    unit: readString(source.unit, null) ?? null,
    sizeValue: readNumber(source.sizeValue, source.size_value, null),
    sizeUnit: readString(source.sizeUnit, source.size_unit, null) ?? null,
    unitPrice: readNumber(source.unitPrice, source.unit_price, null),
    lineTotal: readNumber(source.lineTotal, source.line_total, source.total, 0) ?? 0,
    discount: readNumber(source.discount, null),
    confidence: readNumber(source.confidence, null),
  });
}

function createReceiptItem(input: {
  rawText?: string | null;
  normalizedName: string;
  quantity?: number | null;
  unit?: string | null;
  sizeValue?: number | null;
  sizeUnit?: string | null;
  unitPrice?: number | null;
  lineTotal: number;
  discount?: number | null;
  confidence?: number | null;
}): ReceiptItem {
  return {
    id: createId('draft-item'),
    receiptId: '',
    rawText: input.rawText ?? null,
    normalizedName: input.normalizedName,
    quantity: input.quantity ?? null,
    unit: input.unit ?? null,
    sizeValue: input.sizeValue ?? null,
    sizeUnit: input.sizeUnit ?? null,
    unitPrice: input.unitPrice ?? null,
    lineTotal: input.lineTotal,
    discount: input.discount ?? null,
    confidence: input.confidence ?? null,
  };
}

function asRecord(value: unknown): Record<string, any> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }

  return value as Record<string, any>;
}

function readString(...values: unknown[]): string | null {
  for (const value of values) {
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed) {
        return trimmed;
      }
    }

    if (value === null) {
      return null;
    }
  }

  return null;
}

function readNumber(...values: unknown[]): number | null {
  for (const value of values) {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === 'string') {
      const normalized = value.trim().replace(',', '.');
      const parsed = Number(normalized);

      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }

    if (value === null) {
      return null;
    }
  }

  return null;
}

function normalizeDate(value: string | null): string {
  const trimmed = value?.trim() ?? '';

  if (!trimmed) {
    return '';
  }

  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (isoMatch) {
    return trimmed;
  }

  const norwegianMatch = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(trimmed);
  if (norwegianMatch) {
    const [, day, month, year] = norwegianMatch;
    return `${year}-${month}-${day}`;
  }

  return trimmed;
}

function createId(prefix: string): string {
  const randomPart = Math.random().toString(36).slice(2, 10);
  return `${prefix}-${Date.now()}-${randomPart}`;
}

function createFileName(imageUri: string): string {
  const fromUri = imageUri.split('/').pop();

  if (fromUri && fromUri.includes('.')) {
    return fromUri;
  }

  return `receipt-${Date.now()}.jpg`;
}

function guessMimeType(imageUri: string): string {
  const lower = imageUri.toLowerCase();

  if (lower.endsWith('.png')) {
    return 'image/png';
  }

  if (lower.endsWith('.webp')) {
    return 'image/webp';
  }

  return 'image/jpeg';
}

async function safeReadText(response: Response): Promise<string> {
  try {
    return await response.text();
  } catch {
    return '';
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}