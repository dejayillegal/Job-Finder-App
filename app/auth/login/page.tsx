import { Suspense } from 'react';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { LoginForm } from '@/components/auth/LoginForm';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { SocialAuthProviders } from '@/components/auth/SocialAuthProviders';
import { SecurityFeatures } from '@/components/auth/SecurityFeatures';
import { getServerSession } from '@/core/auth/server';

export const metadata: Metadata = {
  title: 'Enterprise Login - Secure Authentication',
  description: 'Secure enterprise login with multi-factor authentication, SSO integration, and advanced security features.',
};

interface LoginPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function LoginPage({ searchParams }: LoginPageProps): Promise<JSX.Element> {
  const session = await getServerSession();

  if (session?.user) {
    redirect('/dashboard');
  }

  const callbackUrl = typeof searchParams.callbackUrl === 'string' 
    ? searchParams.callbackUrl 
    : '/dashboard';

  const error = typeof searchParams.error === 'string' 
    ? searchParams.error 
    : null;

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to your enterprise account"
      showBackLink
    >
      <div className="space-y-6">
        {/* Social Authentication Providers */}
        <Suspense fallback={<div className="h-12 bg-gray-100 rounded-lg animate-pulse" />}>
          <SocialAuthProviders 
            callbackUrl={callbackUrl}
            providers={['google', 'microsoft', 'okta']}
          />
        </Suspense>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-2 text-gray-500">Or continue with email</span>
          </div>
        </div>

        {/* Login Form */}
        <LoginForm 
          callbackUrl={callbackUrl}
          error={error}
        />

        {/* Security Features */}
        <SecurityFeatures />
      </div>
    </AuthLayout>
  );
}