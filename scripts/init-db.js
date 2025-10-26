const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

console.log('🚀 JobFinder Pro - Resume-Driven Platform');

const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(path.join(dataDir, 'database.db'));
db.pragma('journal_mode = WAL');

try {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      phone TEXT,
      location TEXT DEFAULT 'Bangalore',
      role TEXT DEFAULT 'user',
      created_at DATETIME DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS resumes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      filename TEXT NOT NULL,
      content TEXT NOT NULL,
      parsed_data TEXT,
      skills TEXT,
      experience_years INTEGER,
      current_role TEXT,
      uploaded_at DATETIME DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS jobs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      external_id TEXT,
      source_portal TEXT NOT NULL,
      title TEXT NOT NULL,
      company TEXT NOT NULL,
      location TEXT,
      description TEXT,
      salary_min INTEGER,
      salary_max INTEGER,
      remote INTEGER DEFAULT 0,
      job_type TEXT DEFAULT 'full-time',
      experience_required TEXT,
      skills_required TEXT,
      application_url TEXT NOT NULL,
      posted_date DATE DEFAULT (date('now')),
      match_score REAL DEFAULT 0,
      scraped_at DATETIME DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id),
      UNIQUE(external_id, source_portal)
    );

    CREATE INDEX IF NOT EXISTS idx_jobs_user ON jobs(user_id, match_score DESC);
    CREATE INDEX IF NOT EXISTS idx_resumes_user ON resumes(user_id, uploaded_at DESC);
  `);

  const adminPassword = bcrypt.hashSync('Closer@82', 12);
  db.prepare('INSERT OR REPLACE INTO users (id, email, password, name, role) VALUES (1, ?, ?, ?, "admin")')
    .run('jmunuswa@gmail.com', adminPassword, 'Jayakumar M');

  console.log('✅ Database ready!');
  console.log('   📧 Admin: jmunuswa@gmail.com');
  console.log('   🔐 Password: Closer@82');
  console.log('');
  console.log('🎯 Next: npm run dev');
} catch (error) {
  console.error('❌', error.message);
  process.exit(1);
} finally {
  db.close();
}