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
  name: string;
  phone?: string;
  location?: string;
  role: string;
  email_verified: boolean;
  verification_token?: string;
  password_reset_token?: string;
  password_reset_expires?: string;
  profile_completed: boolean;
  preferred_salary_min?: number;
  preferred_salary_max?: number;
  work_preference: string;
  notification_preferences: string;
  created_at: string;
  updated_at: string;
}

export interface UserSkill {
  id: number;
  user_id: number;
  skill_name: string;
  proficiency_level: number;
  years_experience: number;
  created_at: string;
}

export interface Resume {
  id: number;
  user_id: number;
  filename: string;
  original_filename: string;
  file_size: number;
  content: string;
  parsed_data?: string;
  ats_score?: number;
  ats_breakdown?: string;
  work_experience_years: number;
  extracted_skills?: string;
  extracted_experience?: string;
  extracted_education?: string;
  is_active: boolean;
  analysis_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface Job {
  id: number;
  external_id?: string;
  source_portal: string;
  title: string;
  company: string;
  location?: string;
  description?: string;
  requirements?: string;
  salary_min?: number;
  salary_max?: number;
  salary_currency: string;
  remote: boolean;
  job_type: string;
  experience_required?: string;
  skills_required?: string;
  application_url?: string;
  company_logo_url?: string;
  posted_date: string;
  expires_date?: string;
  is_featured: boolean;
  view_count: number;
  application_count: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface JobMatch {
  id: number;
  user_id: number;
  job_id: number;
  match_score: number;
  skills_match_count: number;
  salary_match: boolean;
  location_match: boolean;
  experience_match: boolean;
  recommended: boolean;
  viewed: boolean;
  created_at: string;
}

export interface Application {
  id: number;
  user_id: number;
  job_id: number;
  resume_id: number;
  status: string;
  cover_letter?: string;
  applied_via: string;
  application_notes?: string;
  interview_date?: string;
  follow_up_date?: string;
  salary_negotiated?: number;
  rejection_reason?: string;
  applied_at: string;
  updated_at: string;
}

export interface JobAlert {
  id: number;
  user_id: number;
  name: string;
  keywords?: string;
  location?: string;
  salary_min?: number;
  remote_only: boolean;
  frequency: string;
  is_active: boolean;
  last_sent?: string;
  created_at: string;
}

export interface ActivityLog {
  id: number;
  user_id: number;
  action_type: string;
  entity_type?: string;
  entity_id?: number;
  details?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}