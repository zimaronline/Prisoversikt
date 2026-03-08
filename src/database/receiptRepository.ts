import type { ParsedReceiptResult } from '../models/parser';
import type { Receipt } from '../models/receipt';
import type { ReceiptItem } from '../models/receiptItem';
import { getDb } from './db';
import { runMigrations } from './migrations';

type ReceiptRow = {
  id: string;
  merchant_name: string;
  purchase_date: string;
  subtotal: number | null;
  total: number;
  vat_total: number | null;
  currency: string;
  image_uri: string;
  raw_ocr_response: string | null;
  parse_confidence: number | null;
  created_at: string;
  updated_at: string;
};

type ReceiptItemRow = {
  id: string;
  receipt_id: string;
  raw_text: string | null;
  normalized_name: string;
  quantity: number | null;
  unit: string | null;
  size_value: number | null;
  size_unit: string | null;
  unit_price: number | null;
  line_total: number;
  discount: number | null;
  confidence: number | null;
};

export async function saveReceiptWithItems(
  parsedReceipt: ParsedReceiptResult
): Promise<string> {
  await runMigrations();

  const db = await getDb();
  const now = new Date().toISOString();
  const receiptId = createId('receipt');

  const merchantName = parsedReceipt.merchantName.trim();
  const purchaseDate = parsedReceipt.purchaseDate.trim();

  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `
        INSERT INTO receipts (
          id,
          merchant_name,
          purchase_date,
          subtotal,
          total,
          vat_total,
          currency,
          image_uri,
          raw_ocr_response,
          parse_confidence,
          created_at,
          updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        receiptId,
        merchantName,
        purchaseDate,
        parsedReceipt.subtotal ?? null,
        parsedReceipt.total,
        parsedReceipt.vatTotal ?? null,
        parsedReceipt.currency || 'NOK',
        parsedReceipt.imageUri,
        parsedReceipt.rawOcrResponse ?? null,
        parsedReceipt.parseConfidence ?? null,
        now,
        now,
      ]
    );

    for (const item of parsedReceipt.items) {
      await db.runAsync(
        `
          INSERT INTO receipt_items (
            id,
            receipt_id,
            raw_text,
            normalized_name,
            quantity,
            unit,
            size_value,
            size_unit,
            unit_price,
            line_total,
            discount,
            confidence
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          createId('item'),
          receiptId,
          item.rawText ?? null,
          item.normalizedName.trim(),
          item.quantity ?? null,
          item.unit ?? null,
          item.sizeValue ?? null,
          item.sizeUnit ?? null,
          item.unitPrice ?? null,
          item.lineTotal,
          item.discount ?? null,
          item.confidence ?? null,
        ]
      );
    }
  });

  return receiptId;
}

export async function getAllReceipts(): Promise<Receipt[]> {
  await runMigrations();

  const db = await getDb();

  const rows = await db.getAllAsync<ReceiptRow>(
    `
      SELECT
        id,
        merchant_name,
        purchase_date,
        subtotal,
        total,
        vat_total,
        currency,
        image_uri,
        raw_ocr_response,
        parse_confidence,
        created_at,
        updated_at
      FROM receipts
      ORDER BY purchase_date DESC, created_at DESC
    `
  );

  return rows.map((row) => mapReceiptRow(row, []));
}

export async function getReceiptById(id: string): Promise<Receipt | null> {
  await runMigrations();

  const db = await getDb();

  const receiptRow = await db.getFirstAsync<ReceiptRow>(
    `
      SELECT
        id,
        merchant_name,
        purchase_date,
        subtotal,
        total,
        vat_total,
        currency,
        image_uri,
        raw_ocr_response,
        parse_confidence,
        created_at,
        updated_at
      FROM receipts
      WHERE id = ?
    `,
    [id]
  );

  if (!receiptRow) {
    return null;
  }

  const itemRows = await db.getAllAsync<ReceiptItemRow>(
    `
      SELECT
        id,
        receipt_id,
        raw_text,
        normalized_name,
        quantity,
        unit,
        size_value,
        size_unit,
        unit_price,
        line_total,
        discount,
        confidence
      FROM receipt_items
      WHERE receipt_id = ?
      ORDER BY rowid ASC
    `,
    [id]
  );

  return mapReceiptRow(
    receiptRow,
    itemRows.map(mapReceiptItemRow)
  );
}

function mapReceiptRow(row: ReceiptRow, items: ReceiptItem[]): Receipt {
  return {
    id: row.id,
    merchantName: row.merchant_name,
    purchaseDate: row.purchase_date,
    subtotal: row.subtotal,
    total: row.total,
    vatTotal: row.vat_total,
    currency: row.currency,
    imageUri: row.image_uri,
    rawOcrResponse: row.raw_ocr_response,
    parseConfidence: row.parse_confidence,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    items,
  };
}

function mapReceiptItemRow(row: ReceiptItemRow): ReceiptItem {
  return {
    id: row.id,
    receiptId: row.receipt_id,
    rawText: row.raw_text,
    normalizedName: row.normalized_name,
    quantity: row.quantity,
    unit: row.unit,
    sizeValue: row.size_value,
    sizeUnit: row.size_unit,
    unitPrice: row.unit_price,
    lineTotal: row.line_total,
    discount: row.discount,
    confidence: row.confidence,
  };
}

function createId(prefix: string): string {
  const randomPart = Math.random().toString(36).slice(2, 10);
  return `${prefix}-${Date.now()}-${randomPart}`;
}