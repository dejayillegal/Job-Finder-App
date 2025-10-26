import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDatabase } from './database';

const JWT_SECRET = process.env.JWT_SECRET || 'job-finder-secret-2024';

export async function login(email: string, password: string) {
  const db = getDatabase();
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return { success: false, error: 'Invalid credentials' };
  }

  const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
  const { password: _, ...userWithoutPassword } = user;
  return { success: true, user: userWithoutPassword, token };
}

export async function register(email: string, password: string, name: string) {
  const db = getDatabase();

  if (db.prepare('SELECT id FROM users WHERE email = ?').get(email)) {
    return { success: false, error: 'Email exists' };
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const result = db.prepare('INSERT INTO users (email, password, name) VALUES (?, ?, ?)')
    .run(email, hashedPassword, name);

  const newUser = db.prepare('SELECT id, email, name FROM users WHERE id = ?').get(result.lastInsertRowid);
  const token = jwt.sign({ userId: (newUser as any).id, email: (newUser as any).email }, JWT_SECRET, { expiresIn: '7d' });

  return { success: true, user: newUser, token };
}