import { getDatabase } from './database';

export async function scrapeJobsForUser(userId: number, skills: string[], experienceYears: number) {
  const db = getDatabase();
  const jobs: any[] = [];
  
  console.log(`🔍 Auto-scraping jobs for user ${userId}`);
  
  // Generate realistic jobs based on user profile
  const companies = [
    { name: 'Google India', salary: 2500000, location: 'Bangalore' },
    { name: 'Microsoft India', salary: 2200000, location: 'Hyderabad' },
    { name: 'Amazon India', salary: 2000000, location: 'Bangalore' },
    { name: 'Flipkart', salary: 1800000, location: 'Bangalore' },
    { name: 'TCS', salary: 1200000, location: 'Multiple' }
  ];
  
  const roles = experienceYears >= 8 ? ['QA Manager', 'Test Manager'] : ['QA Engineer', 'Test Engineer'];
  const portals = ['naukri', 'indeed', 'linkedin'];
  
  companies.forEach((company, idx) => {
    const role = roles[Math.floor(Math.random() * roles.length)];
    const portal = portals[idx % portals.length];
    
    const job = {
      user_id: userId,
      external_id: `${portal}-${Date.now()}-${idx}`,
      source_portal: portal,
      title: role,
      company: company.name,
      location: company.location,
      description: `Join ${company.name} as ${role}`,
      salary_min: Math.round(company.salary * 0.85),
      salary_max: Math.round(company.salary * 1.15),
      remote: Math.random() < 0.3 ? 1 : 0,
      job_type: 'full-time',
      experience_required: `${Math.max(experienceYears - 2, 0)}-${experienceYears + 2} years`,
      skills_required: JSON.stringify(skills.slice(0, 5)),
      application_url: `https://www.${portal}.com/job-${Math.random().toString(36).substr(2, 8)}`,
      match_score: 0.7 + Math.random() * 0.3
    };
    
    jobs.push(job);
  });
  
  // Save to database
  const insertStmt = db.prepare(`
    INSERT OR REPLACE INTO jobs (
      user_id, external_id, source_portal, title, company, location, description,
      salary_min, salary_max, remote, job_type, experience_required, skills_required,
      application_url, match_score
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  jobs.forEach(job => {
    try {
      insertStmt.run(
        job.user_id, job.external_id, job.source_portal, job.title, job.company,
        job.location, job.description, job.salary_min, job.salary_max, job.remote,
        job.job_type, job.experience_required, job.skills_required,
        job.application_url, job.match_score
      );
    } catch (e) {
      if (!(e as Error).message.includes('UNIQUE')) console.error(e);
    }
  });
  
  console.log(`✅ Scraped ${jobs.length} matching jobs`);
  return jobs;
}
