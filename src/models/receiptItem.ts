export interface ReceiptItem {
  id: string;
  receiptId?: string;
  rawText: string;
  normalizedName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  lineTotal: number;
  discount?: number | null;
  confidence?: number | null;
}