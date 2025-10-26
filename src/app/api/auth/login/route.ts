import { NextResponse } from 'next/server';
import { login } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    const result = await login(email, password);

    if (result.success && result.token) {
      const response = NextResponse.json({ success: true, user: result.user });
      response.cookies.set('auth-token', result.token, { httpOnly: true, maxAge: 604800 });
      return response;
    }
    return NextResponse.json({ error: result.error }, { status: 401 });
  } catch {
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}