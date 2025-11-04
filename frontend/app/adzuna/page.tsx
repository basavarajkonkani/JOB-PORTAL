import AdzunaJobSearch from '@/components/adzuna/AdzunaJobSearch';
import Navbar from '@/components/layout/Navbar';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Job Search - Powered by Adzuna | AI Job Portal',
  description: 'Search thousands of jobs from across India. Find your perfect role with real-time job listings powered by Adzuna.',
  openGraph: {
    title: 'Job Search - Powered by Adzuna',
    description: 'Search thousands of jobs from across India',
    type: 'website',
  },
};

export default function AdzunaPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Navbar />
      <AdzunaJobSearch />
    </div>
  );
}
