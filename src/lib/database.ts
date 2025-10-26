import Database from 'better-sqlite3';
import path from 'path';

let db: Database.Database | null = null;

export function getDatabase(): Database.Database {
  if (!db) {
    const dbPath = path.join(process.cwd(), 'data', 'database.db');
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
  }
  return db;
}