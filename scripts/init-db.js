const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

console.log('🚀 JobFinder Pro V4 - Database Initialization');

// Create data directory
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  console.log('📁 Creating data directory...');
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'database.db');
console.log(`📊 Database: ${dbPath}`);

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');

console.log('🗄️ Creating database schema...');

try {
  // Create database schema
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      phone TEXT,
      location TEXT DEFAULT 'Bangalore, Karnataka',
      role TEXT DEFAULT 'user',
      email_verified INTEGER DEFAULT 1,
      profile_completed INTEGER DEFAULT 0,
      years_experience INTEGER DEFAULT 0,
      current_designation TEXT,
      last_login DATETIME,
      login_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT (datetime('now')),
      updated_at DATETIME DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS resumes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      filename TEXT NOT NULL,
      content TEXT NOT NULL,
      parsed_data TEXT,
      skills TEXT,
      experience_years INTEGER DEFAULT 0,
      current_role TEXT,
      uploaded_at DATETIME DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
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
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(external_id, source_portal)
    );

    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_jobs_user_score ON jobs(user_id, match_score DESC);
    CREATE INDEX IF NOT EXISTS idx_resumes_user ON resumes(user_id, uploaded_at DESC);
  `);

  console.log('✅ Database schema created successfully');

  // FIXED: Create admin user with proper parameterized query
  console.log('👤 Creating admin user...');
  const adminPassword = bcrypt.hashSync('Closer@82', 12);
  
  // Use parameterized query to avoid SQL syntax errors
  const insertAdmin = db.prepare(`
    INSERT OR REPLACE INTO users (
      id, email, password, name, role, location, 
      years_experience, current_designation, login_count
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  insertAdmin.run(
    1,                          // id
    'jmunuswa@gmail.com',      // email
    adminPassword,             // password
    'Jayakumar M',             // name
    'admin',                   // role (FIXED: using string value, not column name)
    'Bangalore, Karnataka',    // location
    14,                        // years_experience
    'Senior Test Manager',     // current_designation
    0                          // login_count
  );

  console.log('✅ Admin user created successfully');
  console.log('');
  console.log('📊 Database Ready:');
  console.log('   📧 Admin Email: jmunuswa@gmail.com');
  console.log('   🔐 Password: Closer@82');
  console.log('   👑 Role: admin');
  console.log('   📁 Database: data/database.db');
  console.log('');
  console.log('🚀 Next steps:');
  console.log('   npm run build    # Build for production');
  console.log('   npm run export   # Export static files');
  console.log('   npm run dev      # Start development server');
  console.log('');
  console.log('✅ JobFinder Pro V4 is ready!');

} catch (error) {
  console.error('❌ Database initialization failed:');
  console.error('   Error:', error.message);
  console.error('   Stack:', error.stack);
  process.exit(1);
} finally {
  db.close();
}
