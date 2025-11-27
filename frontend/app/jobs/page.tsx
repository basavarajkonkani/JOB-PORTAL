import JobSearchPage from '@/components/jobs/JobSearchPage';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Metadata } from 'next';

interface SearchParams {
  title?: string;
  level?: string;
  location?: string;
  remote?: string;
  page?: string;
  orgId?: string;
}

interface JobsPageProps {
  searchParams: Promise<SearchParams>;
}

// Generate metadata for job listings page
export async function generateMetadata({ searchParams }: JobsPageProps): Promise<Metadata> {
  const params = await searchParams;
  const filters = [];
  if (params.title) filters.push(params.title);
  if (params.level) filters.push(params.level);
  if (params.location) filters.push(params.location);
  if (params.remote === 'true') filters.push('Remote');

  const title =
    filters.length > 0
      ? `${filters.join(' ')} Jobs | AI Job Portal`
      : 'Find Your Next Opportunity | AI Job Portal';

  const description =
    filters.length > 0
      ? `Browse ${filters.join(' ')} job opportunities. Find your perfect role with AI-powered job matching.`
      : 'Discover job opportunities that match your skills and preferences. AI-powered job search and application assistance.';

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const urlParams = new URLSearchParams(params as Record<string, string>);
  const canonicalUrl = `${baseUrl}/jobs${urlParams.toString() ? `?${urlParams.toString()}` : ''}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'AI Job Portal',
      type: 'website',
      images: [
        {
          url: `${baseUrl}/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: 'AI Job Portal',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${baseUrl}/og-image.jpg`],
    },
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

// Server-side data fetching for job listings
async function getJobs(searchParams: SearchParams) {
  try {
    const params = new URLSearchParams();

    if (searchParams.title) params.append('title', searchParams.title);
    if (searchParams.level) params.append('level', searchParams.level);
    if (searchParams.location) params.append('location', searchParams.location);
    if (searchParams.remote) params.append('remote', searchParams.remote);
    if (searchParams.page) params.append('page', searchParams.page);
    if (searchParams.orgId) params.append('orgId', searchParams.orgId);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const url = `${apiUrl}/api/jobs?${params.toString()}`;

    const res = await fetch(url, {
      cache: 'no-store', // Always fetch fresh data for SSR
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      console.error('Failed to fetch jobs:', res.status);
      return null;
    }

    return res.json();
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return null;
  }
}

export default async function JobsPage({ searchParams }: JobsPageProps) {
  const params = await searchParams;
  const initialData = await getJobs(params);

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <Navbar />
      <main className="pt-4 pb-12">
        <JobSearchPage initialData={initialData} orgId={params.orgId} />
      </main>
      <Footer />
    </div>
  );
}
