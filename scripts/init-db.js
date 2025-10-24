const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

// Create data directory if it doesn't exist
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize database
const db = new Database(path.join(dataDir, 'database.db'));

console.log('🗄️  Initializing database...');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT,
    role TEXT DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS resumes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    filename TEXT NOT NULL,
    content TEXT NOT NULL,
    parsed_data TEXT,
    ats_score INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    location TEXT,
    description TEXT,
    requirements TEXT,
    salary_min INTEGER,
    salary_max INTEGER,
    remote BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    job_id INTEGER NOT NULL,
    resume_id INTEGER NOT NULL,
    status TEXT DEFAULT 'pending',
    applied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (job_id) REFERENCES jobs(id),
    FOREIGN KEY (resume_id) REFERENCES resumes(id)
  );
`);

// Create admin user
const hashedPassword = bcrypt.hashSync('Closer@82', 10);

const insertAdmin = db.prepare(`
  INSERT OR REPLACE INTO users (id, email, password, name, role)
  VALUES (1, 'jmunuswa@gmail.com', ?, 'Jayakumar M', 'admin')
`);

insertAdmin.run(hashedPassword);

// Insert sample jobs
const insertJob = db.prepare(`
  INSERT INTO jobs (title, company, location, description, requirements, salary_min, salary_max, remote)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

const sampleJobs = [
  {
    title: 'Senior QA Engineer',
    company: 'Tech Corp',
    location: 'Bangalore, India',
    description: 'Looking for experienced QA engineer with automation expertise',
    requirements: 'Python, Selenium, CI/CD, 5+ years experience',
    salary_min: 1200000,
    salary_max: 1800000,
    remote: 1
  },
  {
    title: 'Test Automation Lead',
    company: 'Digital Solutions',
    location: 'Hyderabad, India',
    description: 'Lead automation testing initiatives',
    requirements: 'Java, TestNG, Jenkins, Leadership skills',
    salary_min: 1500000,
    salary_max: 2200000,
    remote: 0
  },
  {
    title: 'QA Manager',
    company: 'Innovation Labs',
    location: 'Pune, India',
    description: 'Manage QA team and testing processes',
    requirements: 'Team management, Agile, 8+ years experience',
    salary_min: 1800000,
    salary_max: 2500000,
    remote: 1
  }
];

sampleJobs.forEach(job => {
  insertJob.run(
    job.title,
    job.company,
    job.location,
    job.description,
    job.requirements,
    job.salary_min,
    job.salary_max,
    job.remote ? 1 : 0
  );
});

console.log('✅ Database initialized successfully!');
console.log('✅ Admin user created: jmunuswa@gmail.com / Closer@82');
console.log('✅ Sample jobs inserted');

db.close();
