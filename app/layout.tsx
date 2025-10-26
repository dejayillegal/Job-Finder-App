import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { Analytics } from '@/core/analytics/Analytics';
import { ErrorBoundary } from '@/core/errors/ErrorBoundary';
import { ThemeProvider } from '@/core/theme/ThemeProvider';
import { AuthContextProvider } from '@/core/auth/AuthContext';
import { NotificationProvider } from '@/core/notifications/NotificationProvider';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  preload: true,
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
  preload: false,
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' }
  ],
};

export const metadata: Metadata = {
  title: {
    default: 'JobFinder Pro Enterprise - AI-Powered Talent Acquisition Platform',
    template: '%s | JobFinder Pro Enterprise'
  },
  description: 'Enterprise-grade AI talent acquisition platform with real-time job aggregation, advanced matching algorithms, and comprehensive analytics dashboard.',
  keywords: [
    'enterprise job matching',
    'AI talent acquisition', 
    'automated recruitment',
    'job aggregation platform',
    'resume parsing AI',
    'talent pipeline management'
  ],
  authors: [{ name: 'JobFinder Pro Enterprise Team' }],
  creator: 'JobFinder Pro Enterprise',
  publisher: 'JobFinder Pro Enterprise',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://jobfinder-enterprise.com',
    siteName: 'JobFinder Pro Enterprise',
    title: 'Enterprise AI Talent Acquisition Platform',
    description: 'Advanced AI-powered recruitment platform with real-time job aggregation and intelligent matching.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'JobFinder Pro Enterprise Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'JobFinder Pro Enterprise - AI Talent Acquisition',
    description: 'Enterprise-grade recruitment platform with AI-powered matching',
    images: ['/twitter-image.png'],
  },
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest',
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps): JSX.Element {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://api.jobfinder.com" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const theme = localStorage.getItem('theme') || 'system';
                if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ErrorBoundary>
          <ThemeProvider>
            <AuthContextProvider>
              <NotificationProvider>
                <div id="root" className="relative flex min-h-screen flex-col">
                  <div className="flex-1">
                    {children}
                  </div>
                </div>
                <Analytics />
              </NotificationProvider>
            </AuthContextProvider>
          </ThemeProvider>
        </ErrorBoundary>
        <div id="modal-root" />
        <div id="tooltip-root" />
      </body>
    </html>
  );
}