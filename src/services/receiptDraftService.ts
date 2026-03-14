import type { ParsedReceiptResult } from '../models/parser';

let currentDraft: ParsedReceiptResult | null = null;

export function setReceiptDraft(draft: ParsedReceiptResult): void {
  currentDraft = cloneDraft(draft);
}

export function getReceiptDraft(): ParsedReceiptResult | null {
  return currentDraft ? cloneDraft(currentDraft) : null;
}

export function clearReceiptDraft(): void {
  currentDraft = null;
}

function cloneDraft(draft: ParsedReceiptResult): ParsedReceiptResult {
  return JSON.parse(JSON.stringify(draft)) as ParsedReceiptResult;
}