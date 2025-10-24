import Database from 'better-sqlite3';
import path from 'path';

let db: Database.Database | null = null;

export function getDatabase() {
  if (!db) {
    const dbPath = path.join(process.cwd(), 'data', 'database.db');
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
  }
  return db;
}

export interface User {
  id: number;
  email: string;
  password: string;
  name: string | null;
  role: string;
  created_at: string;
}

export interface Resume {
  id: number;
  user_id: number;
  filename: string;
  content: string;
  parsed_data: string | null;
  ats_score: number | null;
  created_at: string;
}

export interface Job {
  id: number;
  title: string;
  company: string;
  location: string | null;
  description: string | null;
  requirements: string | null;
  salary_min: number | null;
  salary_max: number | null;
  remote: number;
  created_at: string;
}

export interface Application {
  id: number;
  user_id: number;
  job_id: number;
  resume_id: number;
  status: string;
  applied_at: string;
}
