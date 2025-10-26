import { Suspense } from 'react';
import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { HeroSection } from '@/components/home/HeroSection';
import { FeatureShowcase } from '@/components/home/FeatureShowcase';
import { PlatformIntegrations } from '@/components/home/PlatformIntegrations';
import { EnterpriseStats } from '@/components/home/EnterpriseStats';
import { TechnicalArchitecture } from '@/components/home/TechnicalArchitecture';
import { TestimonialCarousel } from '@/components/home/TestimonialCarousel';
import { PricingTiers } from '@/components/home/PricingTiers';
import { CallToAction } from '@/components/home/CallToAction';
import { PageLoader } from '@/components/ui/PageLoader';
import { cn } from '@/lib/utils/cn';

// Dynamic imports for performance optimization
const InteractiveDemo = dynamic(
  () => import('@/components/home/InteractiveDemo'),
  { 
    ssr: false,
    loading: () => <PageLoader className="h-96" />
  }
);

const AIShowcase = dynamic(
  () => import('@/components/home/AIShowcase'),
  {
    ssr: false,
    loading: () => <PageLoader className="h-64" />
  }
);

export const metadata: Metadata = {
  title: 'Enterprise AI Talent Acquisition Platform',
  description: 'Transform your recruitment process with enterprise-grade AI job matching, real-time aggregation, and advanced analytics.',
  openGraph: {
    title: 'JobFinder Pro Enterprise - AI Talent Acquisition Platform',
    description: 'Enterprise-grade recruitment platform with AI-powered matching and real-time job aggregation.',
    url: 'https://jobfinder-enterprise.com',
    images: [
      {
        url: '/og-home.png',
        width: 1200,
        height: 630,
        alt: 'JobFinder Pro Enterprise Homepage',
      },
    ],
  },
};

interface HomePageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function HomePage({ searchParams }: HomePageProps): Promise<JSX.Element> {
  const utmSource = typeof searchParams.utm_source === 'string' ? searchParams.utm_source : null;
  const campaignId = typeof searchParams.campaign === 'string' ? searchParams.campaign : null;

  return (
    <main className={cn(
      "relative overflow-hidden",
      "bg-gradient-to-b from-slate-50 via-white to-blue-50/30"
    )}>
      {/* Hero Section */}
      <section className="relative">
        <HeroSection 
          utmSource={utmSource}
          campaignId={campaignId}
        />
      </section>

      {/* Interactive Demo Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <Suspense fallback={<PageLoader className="h-96" />}>
            <InteractiveDemo />
          </Suspense>
        </div>
      </section>

      {/* Feature Showcase */}
      <section className="py-24 bg-gradient-to-r from-blue-50 to-purple-50">
        <FeatureShowcase />
      </section>

      {/* AI Technology Showcase */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <Suspense fallback={<PageLoader className="h-64" />}>
            <AIShowcase />
          </Suspense>
        </div>
      </section>

      {/* Platform Integrations */}
      <section className="py-24 bg-slate-900">
        <PlatformIntegrations />
      </section>

      {/* Enterprise Statistics */}
      <section className="py-24 bg-white">
        <EnterpriseStats />
      </section>

      {/* Technical Architecture */}
      <section className="py-24 bg-gradient-to-b from-slate-50 to-white">
        <TechnicalArchitecture />
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-slate-900">
        <TestimonialCarousel />
      </section>

      {/* Pricing Tiers */}
      <section className="py-24 bg-white">
        <PricingTiers />
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
        <CallToAction />
      </section>

      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "JobFinder Pro Enterprise",
            "applicationCategory": "BusinessApplication",
            "applicationSubCategory": "Human Resources",
            "operatingSystem": "Web",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.8",
              "reviewCount": "2847"
            }
          })
        }}
      />
    </main>
  );
}