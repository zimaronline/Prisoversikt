import { getDb } from './db';

let hasRunMigrations = false;

export async function runMigrations(): Promise<void> {
  if (hasRunMigrations) {
    return;
  }

  const db = await getDb();

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS receipts (
      id TEXT PRIMARY KEY NOT NULL,
      merchant_name TEXT NOT NULL,
      purchase_date TEXT NOT NULL,
      subtotal REAL,
      total REAL NOT NULL,
      vat_total REAL,
      currency TEXT NOT NULL DEFAULT 'NOK',
      image_uri TEXT NOT NULL,
      raw_ocr_response TEXT,
      parse_confidence REAL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS receipt_items (
      id TEXT PRIMARY KEY NOT NULL,
      receipt_id TEXT NOT NULL,
      raw_text TEXT,
      normalized_name TEXT NOT NULL,
      quantity REAL,
      unit TEXT,
      unit_price REAL,
      line_total REAL NOT NULL,
      discount REAL,
      confidence REAL,
      FOREIGN KEY (receipt_id) REFERENCES receipts(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_receipts_purchase_date
      ON receipts (purchase_date DESC, created_at DESC);

    CREATE INDEX IF NOT EXISTS idx_receipt_items_receipt_id
      ON receipt_items (receipt_id);
  `);

  hasRunMigrations = true;
}