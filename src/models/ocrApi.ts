export type OcrApiReceiptItem = {
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
};

export type OcrApiReceiptResponse = {
  merchantName: string;
  merchantAddress?: string | null;
  purchaseDate: string;
  subtotal?: number | null;
  total: number;
  vatTotal?: number | null;
  currency?: string | null;
  parseConfidence?: number | null;
  items: OcrApiReceiptItem[];
};