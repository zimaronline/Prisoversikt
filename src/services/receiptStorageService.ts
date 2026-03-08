import {
    getAllReceipts,
    getReceiptById,
    saveReceiptWithItems,
} from '../database/receiptRepository';
import type { ParsedReceiptResult } from '../models/parser';
import type { Receipt } from '../models/receipt';

export async function saveParsedReceipt(
  receipt: ParsedReceiptResult
): Promise<string> {
  return saveReceiptWithItems(receipt);
}

export async function listStoredReceipts(): Promise<Receipt[]> {
  return getAllReceipts();
}

export async function getStoredReceipt(id: string): Promise<Receipt | null> {
  return getReceiptById(id);
}