import './globals.css';
import { ThemeProvider } from 'next-themes';
import RealtimeNotification from '@/components/RealtimeNotification';
export const metadata = {
  title: 'BloodConnect BD',
  description: 'জরুরি রক্তদাতা ও রক্তগ্রহীতাদের সংযুক্ত করার অ্যাপ',
  appleWebApp: {
    capable: true,
    title: 'BloodConnect',
    statusBarStyle: 'default' as const,
  },
  icons: {
    apple: '/apple-touch-icon.png',
  },
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