import { getDb } from './db';

let hasRunMigrations = false;

type TableInfoRow = {
  name: string;
};

export async function runMigrations(): Promise<void> {
  if (hasRunMigrations) {
    return;
  }

  const db = await getDb();

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS receipts (
      id TEXT PRIMARY KEY NOT NULL,
      merchant_name TEXT NOT NULL,
      merchant_address TEXT,
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

  await ensureReceiptsColumns();
  await ensureReceiptItemsColumns();

  hasRunMigrations = true;
}

async function ensureReceiptsColumns(): Promise<void> {
  const db = await getDb();

  const columns = await db.getAllAsync<TableInfoRow>(
    `PRAGMA table_info(receipts);`
  );

  const columnNames = new Set(columns.map((column) => column.name));

  if (!columnNames.has('merchant_address')) {
    await db.execAsync(`ALTER TABLE receipts ADD COLUMN merchant_address TEXT;`);
  }
}

async function ensureReceiptItemsColumns(): Promise<void> {
  const db = await getDb();

  const columns = await db.getAllAsync<TableInfoRow>(
    `PRAGMA table_info(receipt_items);`
  );

  const columnNames = new Set(columns.map((column) => column.name));

  if (!columnNames.has('size_value')) {
    await db.execAsync(`ALTER TABLE receipt_items ADD COLUMN size_value REAL;`);
  }

  if (!columnNames.has('size_unit')) {
    await db.execAsync(`ALTER TABLE receipt_items ADD COLUMN size_unit TEXT;`);
  }
}