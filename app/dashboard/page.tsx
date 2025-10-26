import { Suspense } from 'react';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { MetricCards } from '@/components/dashboard/MetricCards';
import { ResumeUploadWidget } from '@/components/dashboard/ResumeUploadWidget';
import { JobMatchingEngine } from '@/components/dashboard/JobMatchingEngine';
import { AnalyticsDashboard } from '@/components/dashboard/AnalyticsDashboard';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { RecommendationEngine } from '@/components/dashboard/RecommendationEngine';
import { IntegrationStatus } from '@/components/dashboard/IntegrationStatus';
import { getServerSession } from '@/core/auth/server';
import { getUserMetrics } from '@/core/analytics/server';
import { PageLoader } from '@/components/ui/PageLoader';

export const metadata: Metadata = {
  title: 'Enterprise Dashboard - AI Job Matching Analytics',
  description: 'Comprehensive analytics dashboard with real-time job matching, performance metrics, and AI insights.',
};

export default async function DashboardPage(): Promise<JSX.Element> {
  const session = await getServerSession();

  if (!session?.user) {
    redirect('/auth/login?callbackUrl=/dashboard');
  }

  const userMetrics = await getUserMetrics(session.user.id);

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      {/* Dashboard Header */}
      <DashboardHeader user={session.user} />

      {/* Metrics Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Suspense fallback={<PageLoader className="h-32" />}>
          <MetricCards metrics={userMetrics} />
        </Suspense>
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Primary Actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Resume Upload Widget */}
          <Suspense fallback={<PageLoader className="h-64" />}>
            <ResumeUploadWidget userId={session.user.id} />
          </Suspense>

          {/* Job Matching Engine */}
          <Suspense fallback={<PageLoader className="h-96" />}>
            <JobMatchingEngine userId={session.user.id} />
          </Suspense>

          {/* Analytics Dashboard */}
          <Suspense fallback={<PageLoader className="h-64" />}>
            <AnalyticsDashboard metrics={userMetrics} />
          </Suspense>
        </div>

        {/* Right Column - Secondary Information */}
        <div className="space-y-6">
          {/* Activity Feed */}
          <Suspense fallback={<PageLoader className="h-64" />}>
            <ActivityFeed userId={session.user.id} />
          </Suspense>

          {/* Recommendation Engine */}
          <Suspense fallback={<PageLoader className="h-48" />}>
            <RecommendationEngine userId={session.user.id} />
          </Suspense>

          {/* Integration Status */}
          <Suspense fallback={<PageLoader className="h-32" />}>
            <IntegrationStatus />
          </Suspense>
        </div>
      </div>
    </div>
  );
}