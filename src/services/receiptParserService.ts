import type { ParsedReceiptResult } from '../models/parser';

export async function parseReceiptMock(
  imageUri: string
): Promise<ParsedReceiptResult> {
  return {
    merchantName: '',
    purchaseDate: '',
    subtotal: null,
    total: 0,
    vatTotal: null,
    currency: 'NOK',
    imageUri,
    rawOcrResponse: null,
    parseConfidence: null,
    items: [],
  };
}