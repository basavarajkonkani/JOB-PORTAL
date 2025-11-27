import Navbar from '@/components/layout/Navbar';
import Link from 'next/link';

interface Organization {
  id: string;
  name: string;
  industry?: string;
  location?: string;
  description?: string;
  website?: string;
  logoUrl?: string;
}

// Fetch organizations from backend
async function getOrganizations(): Promise<Organization[]> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const res = await fetch(`${apiUrl}/api/organizations`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      console.error('Failed to fetch organizations:', res.status);
      return [];
    }

    return res.json();
  } catch (error) {
    console.error('Error fetching organizations:', error);
    return [];
  }
}

// Fetch job count for an organization
async function getOrgJobCount(orgId: string): Promise<number> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const res = await fetch(`${apiUrl}/api/jobs?orgId=${orgId}`, {
      cache: 'no-store',
    });

    if (!res.ok) return 0;

    const data = await res.json();
    return data.jobs?.length || 0;
  } catch (error) {
    return 0;
  }
}

// Default companies as fallback
const defaultCompanies = [
  {
    id: 'techcorp-001',
    name: 'TechCorp',
    logo: '🏢',
    jobs: 45,
    industry: 'Technology',
    location: 'San Francisco, CA',
  },
  {
    id: 'datasystems-002',
    name: 'DataSystems',
    logo: '💻',
    jobs: 32,
    industry: 'Software',
    location: 'New York, NY',
  },
  {
    id: 'cloudworks-003',
    name: 'CloudWorks',
    logo: '☁️',
    jobs: 28,
    industry: 'Cloud Services',
    location: 'Seattle, WA',
  },
  {
    id: 'ai-innovations-004',
    name: 'AI Innovations',
    logo: '🤖',
    jobs: 56,
    industry: 'Artificial Intelligence',
    location: 'Austin, TX',
  },
  {
    id: 'fintech-solutions-005',
    name: 'FinTech Solutions',
    logo: '💰',
    jobs: 41,
    industry: 'Finance',
    location: 'Boston, MA',
  },
  {
    id: 'healthtech-006',
    name: 'HealthTech',
    logo: '🏥',
    jobs: 23,
    industry: 'Healthcare',
    location: 'Chicago, IL',
  },
];

// Get emoji for industry
function getIndustryEmoji(industry?: string): string {
  if (!industry) return '🏢';
  
  const industryLower = industry.toLowerCase();
  if (industryLower.includes('tech') || industryLower.includes('software')) return '💻';
  if (industryLower.includes('cloud')) return '☁️';
  if (industryLower.includes('ai') || industryLower.includes('artificial')) return '🤖';
  if (industryLower.includes('finance') || industryLower.includes('fintech')) return '💰';
  if (industryLower.includes('health')) return '🏥';
  if (industryLower.includes('education')) return '📚';
  if (industryLower.includes('retail') || industryLower.includes('ecommerce')) return '🛒';
  if (industryLower.includes('media') || industryLower.includes('entertainment')) return '🎬';
  return '🏢';
}

export default async function CompaniesPage() {
  // Fetch real organizations from backend
  const organizations = await getOrganizations();
  
  // Use real data if available, otherwise use default companies
  const companies = organizations.length > 0 
    ? await Promise.all(
        organizations.map(async (org) => ({
          id: org.id,
          name: org.name,
          logo: org.logoUrl || getIndustryEmoji(org.industry),
          jobs: await getOrgJobCount(org.id),
          industry: org.industry || 'Technology',
          location: org.location || 'Location not specified',
        }))
      )
    : defaultCompanies;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Top Companies Hiring
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover leading companies and explore career opportunities
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((company) => (
            <div
              key={company.id}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 p-6 border border-gray-100"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="text-5xl">{company.logo}</div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{company.name}</h3>
                  <p className="text-sm text-gray-600">{company.industry}</p>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  {company.location}
                </div>
                <div className="flex items-center gap-2 text-sm text-blue-600 font-medium">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  {company.jobs} open positions
                </div>
              </div>

              <Link
                href={`/jobs?orgId=${company.id}`}
                className="block w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2.5 rounded-lg hover:from-blue-700 hover:to-indigo-700 font-medium transition-all shadow-md hover:shadow-lg text-center"
              >
                View Jobs
              </Link>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
