import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'AI Job Portal - Find Your Dream Job with AI Intelligence',
  description:
    'Discover personalized job recommendations, create AI-enhanced resumes, and connect with top employers. Let artificial intelligence accelerate your career journey.',
  keywords: ['jobs', 'careers', 'AI', 'job search', 'resume builder', 'recruitment'],
  authors: [{ name: 'AI Job Portal' }],
  openGraph: {
    title: 'AI Job Portal - Find Your Dream Job with AI Intelligence',
    description:
      'Discover personalized job recommendations, create AI-enhanced resumes, and connect with top employers.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Job Portal - Find Your Dream Job with AI Intelligence',
    description:
      'Discover personalized job recommendations, create AI-enhanced resumes, and connect with top employers.',
  },
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#2563eb',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
