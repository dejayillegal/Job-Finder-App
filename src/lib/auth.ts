import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { getDatabase, type User } from './database';

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export async function createToken(userId: number, email: string): Promise<string> {
  return new SignJWT({ userId, email })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(SECRET_KEY);
}

export async function verifyToken(token: string) {
  try {
    const verified = await jwtVerify(token, SECRET_KEY);
    return verified.payload;
  } catch (error) {
    return null;
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) return null;

    const payload = await verifyToken(token);
    if (!payload) return null;

    const db = getDatabase();
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(payload.userId as number) as User;

    return user || null;
  } catch (error) {
    return null;
  }
}

export async function login(email: string, password: string): Promise<{ success: boolean; token?: string; error?: string }> {
  const db = getDatabase();
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as User;

  if (!user) {
    return { success: false, error: 'Invalid credentials' };
  }

  const valid = await verifyPassword(password, user.password);

  if (!valid) {
    return { success: false, error: 'Invalid credentials' };
  }

  const token = await createToken(user.id, user.email);

  return { success: true, token };
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('auth-token');
}
