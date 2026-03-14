import {
  deleteReceiptById,
  getAllReceipts,
  getReceiptById,
  saveReceiptWithItems,
  updateReceiptWithItems,
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

export async function deleteStoredReceipt(id: string): Promise<void> {
  await deleteReceiptById(id);
}

export async function updateStoredReceipt(
  id: string,
  receipt: ParsedReceiptResult
): Promise<void> {
  await updateReceiptWithItems(id, receipt);
}