import './globals.css';
import { ThemeProvider } from 'next-themes';

export const metadata = {
  title: 'BloodConnect BD',
  description: 'জরুরি রক্তদাতা ও রক্তগ্রহীতাদের সংযুক্ত করার অ্যাপ',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}