export interface ReceiptItem {
  id: string;
  receiptId?: string;
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
}