import sqlite3 from "sqlite3";
import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";

const DB_PROMISE = Symbol.for("__kitchen_inventory_sqlite_db_promise__");

/** @param {import('sqlite3').Database} db */
function run(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function onRun(err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

/** @param {import('sqlite3').Database} db */
async function migrate(db) {
  await run(db, "PRAGMA foreign_keys = ON");
  await run(
    db,
    `CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`
  );
  await run(
    db,
    `CREATE TABLE IF NOT EXISTS kitchens (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      kitchen_name TEXT NOT NULL,
      location TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`
  );
  await run(
    db,
    `CREATE TABLE IF NOT EXISTS items (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      item_name TEXT NOT NULL,
      unit TEXT NOT NULL,
      category TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`
  );
  await run(
    db,
    `CREATE TABLE IF NOT EXISTS inventory (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      kitchen_id TEXT NOT NULL REFERENCES kitchens(id) ON DELETE CASCADE,
      item_id TEXT NOT NULL REFERENCES items(id) ON DELETE CASCADE,
      quantity REAL NOT NULL,
      price_per_unit REAL NOT NULL,
      total_price REAL NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`
  );
  await run(
    db,
    "CREATE INDEX IF NOT EXISTS idx_kitchens_user ON kitchens(user_id)"
  );
  await run(db, "CREATE INDEX IF NOT EXISTS idx_items_user ON items(user_id)");
  await run(
    db,
    "CREATE INDEX IF NOT EXISTS idx_inventory_user ON inventory(user_id)"
  );
}

function openDatabase() {
  const custom = process.env.SQLITE_DB_PATH?.trim();
  const dbPath = custom || path.join(process.cwd(), "data", "kitchen.db");
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });

  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        reject(err);
        return;
      }
      migrate(db)
        .then(() => resolve(db))
        .catch(reject);
    });
  });
}

/** @returns {Promise<import('sqlite3').Database>} */
export function getSqliteDb() {
  const g = globalThis;
  if (!g[DB_PROMISE]) {
    g[DB_PROMISE] = openDatabase();
  }
  return g[DB_PROMISE];
}

export function newId() {
  return randomUUID();
}

export async function sqlGet(sql, ...params) {
  const db = await getSqliteDb();
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

export async function sqlAll(sql, ...params) {
  const db = await getSqliteDb();
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
}

export async function sqlRun(sql, ...params) {
  const db = await getSqliteDb();
  return run(db, sql, params);
}
