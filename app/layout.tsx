import './globals.css';
import { ThemeProvider } from 'next-themes';
import type { Metadata } from 'next';
import RealtimeNotification from '@/components/RealtimeNotification';
import { SITE_URL, SITE_NAME, SITE_NAME_BN, SITE_DESCRIPTION } from '@/lib/site';
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} (${SITE_NAME_BN}) — জরুরি রক্তদাতা খুঁজুন, বাংলাদেশ`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    'BloodConnect BD',
    'Blood Connect BD',
    'ব্লাড কানেক্ট বিডি',
    'ব্লাড কানেক্ট',
    'রক্তদাতা',
    'রক্ত দরকার',
    'জরুরি রক্ত',
    'blood donor Bangladesh',
    'blood donation Bangladesh',
    'রক্তদান',
    'ব্লাড ডোনার',
  ],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: 'bn_BD',
    title: `${SITE_NAME} (${SITE_NAME_BN}) — জরুরি রক্তদাতা খুঁজুন`,
    description: SITE_DESCRIPTION,
    images: [{ url: '/heart-donation.jpg', width: 1200, height: 760, alt: 'BloodConnect BD — রক্তদান' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} (${SITE_NAME_BN})`,
    description: SITE_DESCRIPTION,
    images: ['/heart-donation.jpg'],
  },
  robots: { index: true, follow: true },
  verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
    : undefined,
  appleWebApp: {
    capable: true,
    title: 'BloodConnect',
    statusBarStyle: 'default' as const,
  },
  icons: {
    icon: '/icon-192.png',
    apple: '/apple-touch-icon.png',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      alternateName: [SITE_NAME_BN, 'Blood Connect BD', 'BloodConnectBD'],
      inLanguage: 'bn-BD',
      description: SITE_DESCRIPTION,
    },
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#org`,
      name: SITE_NAME,
      alternateName: SITE_NAME_BN,
      url: SITE_URL,
      logo: `${SITE_URL}/icon-512.png`,
      areaServed: { '@type': 'Country', name: 'Bangladesh' },
    },
  ],
};

export const viewport = {
  themeColor: '#b91c1c',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bn" suppressHydrationWarning>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        style={{ fontFamily: "'Hind Siliguri', system-ui, -apple-system, 'Segoe UI', sans-serif" }}
        className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
          <RealtimeNotification />
        </ThemeProvider>
      </body>
    </html>
  );
}