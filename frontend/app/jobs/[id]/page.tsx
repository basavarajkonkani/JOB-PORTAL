import JobDetailPage from '@/components/jobs/JobDetailPage';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Metadata } from 'next';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

// Server-side data fetching for job detail
async function getJobDetail(jobId: string) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const url = `${apiUrl}/api/jobs/${jobId}`;

    const res = await fetch(url, {
      cache: 'no-store', // Always fetch fresh data for SSR
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      console.error('Failed to fetch job detail:', res.status);
      return null;
    }

    return res.json();
  } catch (error) {
    console.error('Error fetching job detail:', error);
    return null;
  }
}

// Generate metadata for job detail page
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const jobData = await getJobDetail(id);

  if (!jobData || !jobData.job) {
    return {
      title: 'Job Not Found | AI Job Portal',
      description: 'The requested job posting could not be found.',
    };
  }

  const { job } = jobData;
  const title = `${job.title} - ${job.level} | AI Job Portal`;
  const description =
    job.description.substring(0, 160) + (job.description.length > 160 ? '...' : '');

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const canonicalUrl = `${baseUrl}/jobs/${id}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'AI Job Portal',
      type: 'website',
      images: job.heroImageUrl
        ? [
            {
              url: job.heroImageUrl,
              width: 1200,
              height: 630,
              alt: job.title,
            },
          ]
        : [
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
      images: job.heroImageUrl ? [job.heroImageUrl] : [`${baseUrl}/og-image.jpg`],
    },
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

export default async function JobPage({ params }: PageProps) {
  const { id } = await params;
  const jobData = await getJobDetail(id);

  // Generate JSON-LD structured data for job posting
  const structuredData = jobData?.job
    ? {
        '@context': 'https://schema.org',
        '@type': 'JobPosting',
        title: jobData.job.title,
        description: jobData.job.description,
        datePosted: jobData.job.publishedAt,
        employmentType: jobData.job.type.toUpperCase().replace('-', '_'),
        jobLocationType: jobData.job.remote ? 'TELECOMMUTE' : undefined,
        jobLocation: {
          '@type': 'Place',
          address: {
            '@type': 'PostalAddress',
            addressLocality: jobData.job.location,
          },
        },
        baseSalary: jobData.job.compensation.min
          ? {
              '@type': 'MonetaryAmount',
              currency: jobData.job.compensation.currency,
              value: {
                '@type': 'QuantitativeValue',
                minValue: jobData.job.compensation.min,
                maxValue: jobData.job.compensation.max,
                unitText: 'YEAR',
              },
            }
          : undefined,
        qualifications: jobData.job.requirements?.join(', '),
        experienceRequirements: {
          '@type': 'OccupationalExperienceRequirements',
          monthsOfExperience:
            jobData.job.level === 'entry'
              ? 0
              : jobData.job.level === 'mid'
                ? 24
                : jobData.job.level === 'senior'
                  ? 60
                  : jobData.job.level === 'lead'
                    ? 96
                    : 120,
        },
      }
    : null;

  return (
    <>
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}
      <Navbar />
      <JobDetailPage jobId={id} initialData={jobData} />
      <Footer />
    </>
  );
}
