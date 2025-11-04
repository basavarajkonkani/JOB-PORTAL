import { MetadataRoute } from 'next';

// Fetch all active jobs for sitemap
async function getActiveJobs() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const url = `${apiUrl}/api/jobs?limit=1000`; // Get all jobs for sitemap

    const res = await fetch(url, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      console.error('Failed to fetch jobs for sitemap:', res.status);
      return [];
    }

    const data = await res.json();
    return data.jobs || [];
  } catch (error) {
    console.error('Error fetching jobs for sitemap:', error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const jobs = await getActiveJobs();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/jobs`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/signin`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/signup`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  // Dynamic job pages
  const jobPages: MetadataRoute.Sitemap = jobs.map(
    (job: { id: string; updatedAt?: string; publishedAt: string }) => ({
      url: `${baseUrl}/jobs/${job.id}`,
      lastModified: new Date(job.updatedAt || job.publishedAt),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    })
  );

  return [...staticPages, ...jobPages];
}
