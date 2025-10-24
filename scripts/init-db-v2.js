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

console.log('🗄️ Initializing Enhanced Job Finder Pro V2 database...');

// Enhanced database schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    location TEXT,
    role TEXT DEFAULT 'user',
    email_verified BOOLEAN DEFAULT 0,
    verification_token TEXT,
    password_reset_token TEXT,
    password_reset_expires DATETIME,
    profile_completed BOOLEAN DEFAULT 0,
    preferred_salary_min INTEGER,
    preferred_salary_max INTEGER,
    work_preference TEXT DEFAULT 'hybrid',
    notification_preferences TEXT DEFAULT '{"email": true, "push": false}',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS user_skills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    skill_name TEXT NOT NULL,
    proficiency_level INTEGER DEFAULT 3,
    years_experience INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, skill_name)
  );

  CREATE TABLE IF NOT EXISTS resumes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    filename TEXT NOT NULL,
    original_filename TEXT NOT NULL,
    file_size INTEGER,
    content TEXT NOT NULL,
    parsed_data TEXT,
    ats_score INTEGER,
    ats_breakdown TEXT,
    work_experience_years INTEGER DEFAULT 0,
    extracted_skills TEXT,
    extracted_experience TEXT,
    extracted_education TEXT,
    is_active BOOLEAN DEFAULT 1,
    analysis_completed BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    external_id TEXT,
    source_portal TEXT NOT NULL DEFAULT 'direct',
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    location TEXT,
    description TEXT,
    requirements TEXT,
    salary_min INTEGER,
    salary_max INTEGER,
    salary_currency TEXT DEFAULT 'INR',
    remote BOOLEAN DEFAULT 0,
    job_type TEXT DEFAULT 'full-time',
    experience_required TEXT,
    skills_required TEXT,
    application_url TEXT,
    company_logo_url TEXT,
    posted_date DATE DEFAULT CURRENT_DATE,
    expires_date DATE,
    is_featured BOOLEAN DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    application_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(external_id, source_portal)
  );

  CREATE TABLE IF NOT EXISTS job_matches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    job_id INTEGER NOT NULL,
    match_score REAL NOT NULL,
    skills_match_count INTEGER DEFAULT 0,
    salary_match BOOLEAN DEFAULT 0,
    location_match BOOLEAN DEFAULT 0,
    experience_match BOOLEAN DEFAULT 0,
    recommended BOOLEAN DEFAULT 0,
    viewed BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    UNIQUE(user_id, job_id)
  );

  CREATE TABLE IF NOT EXISTS applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    job_id INTEGER NOT NULL,
    resume_id INTEGER NOT NULL,
    status TEXT DEFAULT 'applied',
    cover_letter TEXT,
    applied_via TEXT DEFAULT 'direct',
    application_notes TEXT,
    interview_date DATETIME,
    follow_up_date DATE,
    salary_negotiated INTEGER,
    rejection_reason TEXT,
    applied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS job_alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    keywords TEXT,
    location TEXT,
    salary_min INTEGER,
    remote_only BOOLEAN DEFAULT 0,
    frequency TEXT DEFAULT 'daily',
    is_active BOOLEAN DEFAULT 1,
    last_sent DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS activity_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    action_type TEXT NOT NULL,
    entity_type TEXT,
    entity_id INTEGER,
    details TEXT,
    ip_address TEXT,
    user_agent TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  -- Indexes for performance
  CREATE INDEX IF NOT EXISTS idx_jobs_posted_date ON jobs(posted_date DESC);
  CREATE INDEX IF NOT EXISTS idx_jobs_location ON jobs(location);
  CREATE INDEX IF NOT EXISTS idx_jobs_title ON jobs(title);
  CREATE INDEX IF NOT EXISTS idx_job_matches_score ON job_matches(match_score DESC);
  CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
  CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
  CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON activity_logs(user_id, created_at DESC);
`);

// Insert sample enhanced jobs with recent dates
const insertJob = db.prepare(`
  INSERT OR REPLACE INTO jobs (
    title, company, location, description, requirements, salary_min, salary_max, 
    remote, job_type, experience_required, skills_required, posted_date, source_portal
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const today = new Date();
const yesterday = new Date(today);
yesterday.setDate(yesterday.getDate() - 1);
const twoDaysAgo = new Date(today);
twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
const threeDaysAgo = new Date(today);
threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
const fourDaysAgo = new Date(today);
fourDaysAgo.setDate(fourDaysAgo.getDate() - 4);
const fiveDaysAgo = new Date(today);
fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

const enhancedJobs = [
  {
    title: 'Senior QA Manager - Embedded Systems',
    company: 'Google India',
    location: 'Bangalore, Karnataka',
    description: 'Lead QA for GNSS and Android automotive systems. Drive test strategy for GPS/BLE medical devices with regulatory compliance.',
    requirements: 'Python, Selenium, GNSS, GPS, BLE, FDA 21 CFR, ISO 13485, Jenkins, 8+ years experience',
    salary_min: 2200000,
    salary_max: 3200000,
    remote: 1,
    job_type: 'full-time',
    experience_required: '8-12 years',
    skills_required: '["Python", "Selenium", "GNSS", "GPS", "BLE", "FDA 21 CFR", "ISO 13485", "Jenkins", "Embedded Systems"]',
    posted_date: today.toISOString().split('T')[0],
    source_portal: 'linkedin'
  },
  {
    title: 'Test Automation Lead - Performance',
    company: 'Microsoft India',
    location: 'Hyderabad, Telangana',
    description: 'Lead automation testing for cloud services. Build CI/CD pipelines with Python and performance testing expertise.',
    requirements: 'Python, pytest, Selenium, Appium, JMeter, Performance Testing, CI/CD, Jenkins, GitHub Actions',
    salary_min: 1800000,
    salary_max: 2800000,
    remote: 1,
    job_type: 'full-time',
    experience_required: '6-10 years',
    skills_required: '["Python", "pytest", "Selenium", "Appium", "JMeter", "Performance Testing", "CI/CD", "Jenkins"]',
    posted_date: yesterday.toISOString().split('T')[0],
    source_portal: 'naukri'
  },
  {
    title: 'Principal Test Architect - Medical Devices',
    company: 'Philips Healthcare',
    location: 'Bangalore, Karnataka',
    description: 'Architect test frameworks for FDA regulated medical devices. BLE/IoT testing with regulatory compliance expertise.',
    requirements: 'Python, BLE, IoT, FDA 21 CFR, IEC 62304, ISO 13485, RTOS, OTA, Embedded Testing, 10+ years',
    salary_min: 2500000,
    salary_max: 3500000,
    remote: 0,
    job_type: 'full-time',
    experience_required: '10-15 years',
    skills_required: '["Python", "BLE", "IoT", "FDA 21 CFR", "IEC 62304", "ISO 13485", "RTOS", "OTA", "Embedded Testing"]',
    posted_date: twoDaysAgo.toISOString().split('T')[0],
    source_portal: 'glassdoor'
  },
  {
    title: 'SDET - API & Performance Testing',
    company: 'Amazon India',
    location: 'Bangalore, Karnataka',
    description: 'Build test automation for AWS services. API testing with Postman, performance testing with JMeter, CI/CD expertise.',
    requirements: 'Python, API Testing, Postman, JMeter, Performance Testing, AWS, Jenkins, GitLab CI',
    salary_min: 1600000,
    salary_max: 2400000,
    remote: 1,
    job_type: 'full-time',
    experience_required: '4-8 years',
    skills_required: '["Python", "API Testing", "Postman", "JMeter", "Performance Testing", "AWS", "Jenkins", "GitLab CI"]',
    posted_date: threeDaysAgo.toISOString().split('T')[0],
    source_portal: 'indeed'
  },
  {
    title: 'Embedded QA Lead - Automotive',
    company: 'Bosch India',
    location: 'Bangalore, Karnataka',
    description: 'Lead embedded testing for automotive GNSS systems. RTOS, OTA updates, and performance testing expertise required.',
    requirements: 'Embedded Testing, GNSS, GPS, RTOS, OTA, Python, Performance Testing, Automotive, 7+ years',
    salary_min: 1900000,
    salary_max: 2700000,
    remote: 0,
    job_type: 'full-time',
    experience_required: '7-12 years',
    skills_required: '["Embedded Testing", "GNSS", "GPS", "RTOS", "OTA", "Python", "Performance Testing", "Automotive"]',
    posted_date: fourDaysAgo.toISOString().split('T')[0],
    source_portal: 'monster'
  },
  {
    title: 'QA Strategy Manager - Healthcare',
    company: 'Siemens Healthineers',
    location: 'Mumbai, Maharashtra',
    description: 'Drive QA strategy for medical imaging devices. FDA compliance, risk-based testing, team leadership.',
    requirements: 'QA Management, FDA 21 CFR, ISO 13485, Risk-based Testing, Team Leadership, Medical Devices, 10+ years',
    salary_min: 2300000,
    salary_max: 3100000,
    remote: 1,
    job_type: 'full-time',
    experience_required: '10-15 years',
    skills_required: '["QA Management", "FDA 21 CFR", "ISO 13485", "Risk-based Testing", "Team Leadership", "Medical Devices"]',
    posted_date: fiveDaysAgo.toISOString().split('T')[0],
    source_portal: 'adzuna'
  },
  {
    title: 'Senior Automation Engineer - Mobile',
    company: 'Samsung R&D India',
    location: 'Bangalore, Karnataka',
    description: 'Mobile app automation testing with Appium and Selenium. Android/iOS testing, CI/CD pipeline integration.',
    requirements: 'Appium, Selenium, Mobile Testing, Android, iOS, Python, Jenkins, GitHub Actions, 5+ years',
    salary_min: 1500000,
    salary_max: 2200000,
    remote: 1,
    job_type: 'full-time',
    experience_required: '5-8 years',
    skills_required: '["Appium", "Selenium", "Mobile Testing", "Android", "iOS", "Python", "Jenkins", "GitHub Actions"]',
    posted_date: today.toISOString().split('T')[0],
    source_portal: 'linkedin'
  }
];

enhancedJobs.forEach(job => {
  insertJob.run(
    job.title, job.company, job.location, job.description, job.requirements,
    job.salary_min, job.salary_max, job.remote ? 1 : 0, job.job_type,
    job.experience_required, job.skills_required, job.posted_date, job.source_portal
  );
});

console.log('✅ Enhanced V2 Database initialized successfully!');
console.log('✅ Enhanced job listings inserted with recent dates');
console.log('✅ Multi-portal job tracking enabled');
console.log('✅ Advanced matching system ready');
console.log('✅ User skill management available');
console.log('✅ Application tracking system active');

db.close();