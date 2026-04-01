const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const os = require("os");

// Use AppData folder so DB persists and isn't read-only
const userDataPath = path.join(os.homedir(), "AppData", "Roaming", "medical-store-pos");

// Create folder if it doesn't exist
const fs = require("fs");
if (!fs.existsSync(userDataPath)) {
  fs.mkdirSync(userDataPath, { recursive: true });
}

const dbPath = path.join(userDataPath, "medical_store.db");
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS suppliers(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    phone TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    batch_number TEXT,
    purchase_price REAL,
    sale_price REAL,
    quantity INTEGER,
    discount REAL DEFAULT 0,
    gst REAL DEFAULT 0
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS invoices(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_number TEXT,
    supplier_name TEXT,
    suplier_address TEXT,
    phone TEXT,
    saleMan TEXT,
    saleMan_Address TEXT,
    payment_mode TEXT,
    date TEXT,
    total INTEGER,
    company_name TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS invoice_items(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_id INTEGER,
    product_id INTEGER,
    product_name TEXT,       
    purchase_price REAL,
    batch_number TEXT,
    qty INTEGER,
    sale_price REAL,
    discount_percent REAL,
    discount_amount REAL,
    total REAL,
    gst_percent REAL DEFAULT 0,
    gst_amount REAL DEFAULT 0
  )`);
});

module.exports = db;