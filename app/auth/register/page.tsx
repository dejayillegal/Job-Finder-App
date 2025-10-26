import { Suspense } from 'react';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { RegistrationForm } from '@/components/auth/RegistrationForm';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { SocialAuthProviders } from '@/components/auth/SocialAuthProviders';
import { EnterpriseFeatures } from '@/components/auth/EnterpriseFeatures';
import { ComplianceNotice } from '@/components/auth/ComplianceNotice';
import { getServerSession } from '@/core/auth/server';

export const metadata: Metadata = {
  title: 'Enterprise Registration - Join JobFinder Pro',
  description: 'Create your enterprise account with advanced security, compliance features, and full platform access.',
};

interface RegisterPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function RegisterPage({ searchParams }: RegisterPageProps): Promise<JSX.Element> {
  const session = await getServerSession();

  if (session?.user) {
    redirect('/dashboard');
  }

  const inviteToken = typeof searchParams.invite === 'string' 
    ? searchParams.invite 
    : null;

  const planTier = typeof searchParams.plan === 'string' 
    ? searchParams.plan 
    : 'professional';

  return (
    <AuthLayout
      title="Create Enterprise Account"
      subtitle="Join thousands of professionals using AI-powered recruitment"
      showBackLink
    >
      <div className="space-y-6">
        {/* Enterprise Features Highlight */}
        <EnterpriseFeatures planTier={planTier} />

        {/* Social Authentication Providers */}
        <Suspense fallback={<div className="h-12 bg-gray-100 rounded-lg animate-pulse" />}>
          <SocialAuthProviders 
            callbackUrl="/dashboard"
            providers={['google', 'microsoft', 'github']}
            mode="register"
          />
        </Suspense>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-2 text-gray-500">Or register with email</span>
          </div>
        </div>

        {/* Registration Form */}
        <RegistrationForm 
          inviteToken={inviteToken}
          planTier={planTier}
        />

        {/* Compliance Notice */}
        <ComplianceNotice />
      </div>
    </AuthLayout>
  );
}