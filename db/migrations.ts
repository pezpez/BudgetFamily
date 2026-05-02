import { sqliteDb } from './client';

export async function runMigrations() {
  await sqliteDb.execAsync('PRAGMA journal_mode = WAL;');
  await sqliteDb.execAsync('PRAGMA foreign_keys = ON;');

  await sqliteDb.execAsync(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      icon TEXT NOT NULL DEFAULT 'shape',
      color TEXT NOT NULL DEFAULT '#5C6BC0',
      created_at INTEGER NOT NULL
    )
  `);

  await sqliteDb.execAsync(`
    CREATE TABLE IF NOT EXISTS subcategories (
      id TEXT PRIMARY KEY,
      category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      icon TEXT NOT NULL DEFAULT 'tag',
      monthly_budget REAL,
      created_at INTEGER NOT NULL
    )
  `);

  // Migration colonne monthly_budget (tables existantes)
  await sqliteDb.execAsync(
    'ALTER TABLE subcategories ADD COLUMN monthly_budget REAL'
  ).catch(() => {});

  await sqliteDb.execAsync(`
    CREATE TABLE IF NOT EXISTS recurring_rules (
      id TEXT PRIMARY KEY,
      subcategory_id TEXT NOT NULL REFERENCES subcategories(id),
      amount REAL NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('income','expense')),
      frequency TEXT NOT NULL CHECK(frequency IN ('daily','weekly','monthly','yearly')),
      day_of_month INTEGER,
      day_of_week INTEGER,
      start_date INTEGER NOT NULL,
      end_date INTEGER,
      is_active INTEGER NOT NULL DEFAULT 1,
      note TEXT,
      last_generated_at INTEGER
    )
  `);

  await sqliteDb.execAsync(`
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      subcategory_id TEXT NOT NULL REFERENCES subcategories(id),
      amount REAL NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('income','expense')),
      date INTEGER NOT NULL,
      note TEXT,
      is_recurring INTEGER NOT NULL DEFAULT 0,
      recurring_rule_id TEXT REFERENCES recurring_rules(id),
      created_at INTEGER NOT NULL
    )
  `);
}
