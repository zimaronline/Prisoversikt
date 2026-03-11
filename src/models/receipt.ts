import type { ReceiptItem } from './receiptItem';

export interface Receipt {
  id: string;
  merchantName: string;
  merchantAddress?: string | null;
  purchaseDate: string;
  subtotal?: number | null;
  total: number;
  vatTotal?: number | null;
  currency: string;
  imageUri: string;
  rawOcrResponse?: string | null;
  parseConfidence?: number | null;
  createdAt: string;
  updatedAt: string;
  items: ReceiptItem[];
}