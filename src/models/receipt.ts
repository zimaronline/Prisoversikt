import { ReceiptItem } from './receiptItem';

export interface Receipt {
  id: string;
  storeName: string;
  purchaseDate: string;
  subtotalAmount?: number | null;
  taxAmount?: number | null;
  totalAmount: number;
  currency: string;
  imageUri: string;
  rawText?: string | null;
  createdAt: string;
  items: ReceiptItem[];
}