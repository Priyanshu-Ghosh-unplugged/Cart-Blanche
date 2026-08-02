import Database from 'better-sqlite3';
import path from 'path';

// Database path
const dbPath = path.join(process.cwd(), 'cartblanche.db');
const db = new Database(dbPath);

// Enable WAL mode for high concurrency
db.pragma('journal_mode = WAL');

// Initialize Database Schema
export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS goals (
      id TEXT PRIMARY KEY,
      input_text TEXT NOT NULL,
      scenario_title TEXT NOT NULL,
      description TEXT,
      total_amount REAL NOT NULL,
      suggested_limit REAL NOT NULL,
      merchant_count INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS bom_items (
      id TEXT PRIMARY KEY,
      goal_id TEXT NOT NULL,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      merchant TEXT NOT NULL,
      merchant_logo TEXT,
      merchant_color TEXT,
      url TEXT,
      price REAL NOT NULL,
      quantity INTEGER NOT NULL,
      stock_status TEXT,
      sku TEXT,
      image TEXT,
      spec TEXT,
      FOREIGN KEY (goal_id) REFERENCES goals (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS prava_cards (
      card_id TEXT PRIMARY KEY,
      merchant_name TEXT NOT NULL,
      card_number TEXT NOT NULL,
      masked_card_number TEXT NOT NULL,
      exp_date TEXT NOT NULL,
      cvv TEXT NOT NULL,
      card_holder TEXT NOT NULL,
      limit_amount REAL NOT NULL,
      spent_amount REAL DEFAULT 0,
      status TEXT DEFAULT 'active',
      merchant_lock TEXT NOT NULL,
      generated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS prava_transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      transaction_id TEXT NOT NULL,
      session_id TEXT,
      merchant_name TEXT NOT NULL,
      endpoint_url TEXT NOT NULL,
      http_method TEXT NOT NULL,
      http_status INTEGER NOT NULL,
      request_payload TEXT,
      response_payload TEXT,
      tokenized_card TEXT,
      amount REAL NOT NULL,
      status TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS orders (
      order_id TEXT PRIMARY KEY,
      goal_id TEXT NOT NULL,
      merchant_name TEXT NOT NULL,
      merchant_logo TEXT,
      subtotal REAL NOT NULL,
      shipping_fee REAL DEFAULT 0,
      tax_amount REAL DEFAULT 0,
      total_paid REAL NOT NULL,
      prava_card_used TEXT NOT NULL,
      confirmation_screenshot TEXT,
      tracking_number TEXT,
      status TEXT DEFAULT 'confirmed',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (goal_id) REFERENCES goals (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS execution_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      goal_id TEXT NOT NULL,
      tab_id TEXT NOT NULL,
      merchant_name TEXT NOT NULL,
      step_title TEXT NOT NULL,
      status TEXT NOT NULL,
      log_message TEXT NOT NULL,
      active_selector TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  console.log('[SQLite DB] CartBlanche database schema initialized with prava_transactions table at:', dbPath);
}

export default db;
