import type { ReceiptItem } from './receiptItem';

export interface ParsedReceiptResult {
  merchantName: string;
  purchaseDate: string;
  subtotal?: number | null;
  total: number;
  vatTotal?: number | null;
  currency: string;
  imageUri: string;
  rawOcrResponse?: string | null;
  parseConfidence?: number | null;
  items: ReceiptItem[];
}