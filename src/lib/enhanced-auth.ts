import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDatabase, type User } from './database-v2';

const JWT_SECRET = process.env.JWT_SECRET || 'your-enhanced-secret-key';

export interface AuthResult {
  success: boolean;
  user?: Omit<User, 'password'>;
  token?: string;
  error?: string;
}

export async function register(
  email: string, 
  password: string, 
  name: string,
  phone?: string,
  location?: string
): Promise<AuthResult> {
  try {
    const db = getDatabase();

    // Check if user already exists
    const existingUser = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (existingUser) {
      return { success: false, error: 'Email already registered' };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate verification token
    const verificationToken = jwt.sign({ email }, JWT_SECRET, { expiresIn: '24h' });

    // Insert new user
    const insertUser = db.prepare(`
      INSERT INTO users (email, password, name, phone, location, verification_token)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const result = insertUser.run(email, hashedPassword, name, phone || null, location || null, verificationToken);

    // Get the created user (without password)
    const newUser = db.prepare(`
      SELECT id, email, name, phone, location, role, email_verified, profile_completed, created_at
      FROM users WHERE id = ?
    `).get(result.lastInsertRowid) as Omit<User, 'password'>;

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return { success: true, user: newUser, token };
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, error: 'Registration failed' };
  }
}

export async function login(email: string, password: string): Promise<AuthResult> {
  try {
    const db = getDatabase();

    // Get user with password
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as User;

    if (!user) {
      return { success: false, error: 'Invalid credentials' };
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return { success: false, error: 'Invalid credentials' };
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    // Update last login
    db.prepare('UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(user.id);

    return { success: true, user: userWithoutPassword, token };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'Login failed' };
  }
}

export async function getCurrentUser(request: NextRequest): Promise<Omit<User, 'password'> | null> {
  try {
    const token = request.cookies.get('auth-token')?.value || 
                 request.headers.get('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return null;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    const db = getDatabase();

    const user = db.prepare(`
      SELECT id, email, name, phone, location, role, email_verified, profile_completed, 
             preferred_salary_min, preferred_salary_max, work_preference, created_at, updated_at
      FROM users WHERE id = ?
    `).get(decoded.userId) as Omit<User, 'password'>;

    return user || null;
  } catch (error) {
    return null;
  }
}

export async function updateUserProfile(
  userId: number,
  updates: {
    name?: string;
    phone?: string;
    location?: string;
    preferred_salary_min?: number;
    preferred_salary_max?: number;
    work_preference?: string;
  }
): Promise<AuthResult> {
  try {
    const db = getDatabase();

    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updates);

    db.prepare(`
      UPDATE users SET ${fields}, updated_at = CURRENT_TIMESTAMP, profile_completed = 1 
      WHERE id = ?
    `).run(...values, userId);

    const updatedUser = db.prepare(`
      SELECT id, email, name, phone, location, role, email_verified, profile_completed,
             preferred_salary_min, preferred_salary_max, work_preference, created_at, updated_at
      FROM users WHERE id = ?
    `).get(userId) as Omit<User, 'password'>;

    return { success: true, user: updatedUser };
  } catch (error) {
    console.error('Profile update error:', error);
    return { success: false, error: 'Profile update failed' };
  }
}

export async function resetPassword(email: string): Promise<{ success: boolean; message: string }> {
  try {
    const db = getDatabase();
    const user = db.prepare('SELECT id FROM users WHERE email = ?').get(email);

    if (!user) {
      return { success: false, message: 'Email not found' };
    }

    const resetToken = jwt.sign({ email }, JWT_SECRET, { expiresIn: '1h' });
    const expires = new Date(Date.now() + 3600000); // 1 hour

    db.prepare(`
      UPDATE users SET password_reset_token = ?, password_reset_expires = ? WHERE email = ?
    `).run(resetToken, expires.toISOString(), email);

    // In a real app, send email with reset link
    console.log('Password reset token:', resetToken);

    return { success: true, message: 'Password reset link sent to email' };
  } catch (error) {
    return { success: false, message: 'Reset request failed' };
  }
}

export function logActivity(
  userId: number,
  actionType: string,
  entityType?: string,
  entityId?: number,
  details?: any,
  request?: NextRequest
) {
  try {
    const db = getDatabase();
    const ipAddress = request?.ip || request?.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = request?.headers.get('user-agent') || 'unknown';

    db.prepare(`
      INSERT INTO activity_logs (user_id, action_type, entity_type, entity_id, details, ip_address, user_agent)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      userId,
      actionType,
      entityType || null,
      entityId || null,
      details ? JSON.stringify(details) : null,
      ipAddress,
      userAgent
    );
  } catch (error) {
    console.error('Activity logging error:', error);
  }
}