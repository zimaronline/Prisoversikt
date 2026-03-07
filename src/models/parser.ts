import { ReceiptItem } from './receiptItem';

export interface ParsedReceiptResult {
  storeName: string;
  purchaseDate: string;
  subtotalAmount?: number | null;
  taxAmount?: number | null;
  totalAmount: number;
  currency: string;
  imageUri: string;
  rawText?: string | null;
  items: ReceiptItem[];
}