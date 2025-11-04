'use client';

import { useState, useEffect } from 'react';
import JobFilters from './JobFilters';
import { useAnalytics } from '@/lib/useAnalytics';
import { Search, MapPin, Briefcase, DollarSign, ExternalLink } from 'lucide-react';

interface Job {
  id: string;
  title: string;
  level: string;
  location: string;
  type: string;
  remote: boolean;
  description: string;
  compensation: {
    min?: number;
    max?: number;
    currency: string;
  };
  orgId: string;
  heroImageUrl?: string;
  publishedAt: string;
}

interface SearchResult {
  jobs: Job[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface Filters {
  title: string;
  level: string;
  location: string;
  remote: boolean | null;
}

interface AdzunaJob {
  id: string;
  title: string;
  company: string;
  location: string;
  salary_min?: number;
  salary_max?: number;
  salary_is_predicted?: string;
  description: string;
  created: string;
  redirect_url: string;
  category: string;
  contract_type?: string;
}

interface JobSearchPageProps {
  initialData?: SearchResult | null;
  orgId?: string;
}

export default function JobSearchPage({ initialData, orgId }: JobSearchPageProps) {
  const [filters, setFilters] = useState<Filters>({
    title: 'full stack developer',
    level: '',
    location: '',
    remote: null,
  });
  
  // Internal jobs state
  const [internalJobs, setInternalJobs] = useState<Job[]>(initialData?.jobs || []);
  const [internalLoading, setInternalLoading] = useState(false);
  const [orgName, setOrgName] = useState<string>('');
  
  // Adzuna state
  const [adzunaJobs, setAdzunaJobs] = useState<AdzunaJob[]>([]);
  const [adzunaLoading, setAdzunaLoading] = useState(false);
  const [adzunaError, setAdzunaError] = useState('');
  const [adzunaTotalCount, setAdzunaTotalCount] = useState(0);
  const [adzunaPage, setAdzunaPage] = useState(1);
  
  const { trackJobSearch, trackPageView } = useAnalytics();

  useEffect(() => {
    trackPageView('/jobs');
    
    // If orgId is provided, fetch organization jobs
    if (orgId) {
      fetchOrgJobs();
    } else {
      // Check if there's a search query from navbar
      const navbarQuery = sessionStorage.getItem('jobSearchQuery');
      if (navbarQuery) {
        setFilters(prev => ({ ...prev, title: navbarQuery }));
        sessionStorage.removeItem('jobSearchQuery');
      } else {
        // Load default full stack jobs on mount
        searchAdzunaJobs(1);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId]);
  
  useEffect(() => {
    if (filters.title) {
      searchAdzunaJobs(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.title, filters.location]);

  const fetchOrgJobs = async () => {
    if (!orgId) return;
    
    setInternalLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      
      // Fetch organization details
      const orgResponse = await fetch(`${apiUrl}/api/organizations/${orgId}`);
      if (orgResponse.ok) {
        const orgData = await orgResponse.json();
        setOrgName(orgData.name);
      }
      
      // Fetch jobs for this organization
      const jobsResponse = await fetch(`${apiUrl}/api/jobs?orgId=${orgId}`);
      if (jobsResponse.ok) {
        const jobsData = await jobsResponse.json();
        setInternalJobs(jobsData.jobs || []);
      }
    } catch (error) {
      console.error('Failed to fetch organization jobs:', error);
      setInternalJobs([]);
    } finally {
      setInternalLoading(false);
    }
  };

  const handleFilterChange = (newFilters: Filters) => {
    setFilters(newFilters);
    setAdzunaPage(1);
  };

  const searchAdzunaJobs = async (page: number = 1) => {
    if (!filters.title.trim()) {
      setAdzunaError('Please enter a job title or keyword to search');
      return;
    }

    setAdzunaLoading(true);
    setAdzunaError('');

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      
      const params = new URLSearchParams({
        what: filters.title.trim(),
        ...(filters.location.trim() && { where: filters.location.trim() }),
        results_per_page: '10',
        page: page.toString(),
      });

      const response = await fetch(
        `${apiUrl}/api/adzuna/search?${params.toString()}`
      );
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch jobs');
      }

      setAdzunaJobs(data.results);
      setAdzunaTotalCount(data.count);
      setAdzunaPage(page);
    } catch (err: any) {
      setAdzunaError(err.message || 'Failed to fetch jobs. Please try again.');
      setAdzunaJobs([]);
    } finally {
      setAdzunaLoading(false);
    }
  };

  const formatSalary = (job: AdzunaJob) => {
    if (!job.salary_min && !job.salary_max) {
      return 'Salary not specified';
    }

    const formatAmount = (amount: number) => {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
      }).format(amount);
    };

    if (job.salary_min && job.salary_max) {
      return `${formatAmount(job.salary_min)} - ${formatAmount(job.salary_max)}${job.salary_is_predicted === '1' ? ' (estimated)' : ''}`;
    }

    return job.salary_min
      ? `From ${formatAmount(job.salary_min)}`
      : `Up to ${formatAmount(job.salary_max!)}`;
  };

  const truncateDescription = (description: string, maxLength: number = 200) => {
    const plainText = description.replace(/<[^>]*>/g, '');
    if (plainText.length <= maxLength) return plainText;
    return plainText.substring(0, maxLength) + '...';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div>
      <div className="mb-8">
        {orgId ? (
          <>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {orgName ? `Jobs at ${orgName}` : 'Company Jobs'}
            </h2>
            <p className="text-base text-gray-600">
              Explore open positions at this company
              {internalJobs.length > 0 && (
                <span className="ml-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                  {internalJobs.length} {internalJobs.length === 1 ? 'position' : 'positions'} available
                </span>
              )}
            </p>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Global Job Search</h2>
            <p className="text-base text-gray-600">
              Search thousands of jobs from across India powered by Adzuna
              {adzunaTotalCount > 0 && (
                <span className="ml-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                  {adzunaTotalCount.toLocaleString()} jobs available
                </span>
              )}
            </p>
          </>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar - Only show for global search */}
          {!orgId && (
            <aside className="lg:w-64 flex-shrink-0">
              <JobFilters filters={filters} onFilterChange={handleFilterChange} />
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Tip:</strong> Try searching for "developer", "designer", or "engineer"
                </p>
                {filters.title && (
                  <button
                    onClick={() => searchAdzunaJobs(1)}
                    className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    Search Jobs
                  </button>
                )}
              </div>
            </aside>
          )}

          {/* Job Results */}
          <main className={orgId ? 'w-full' : 'flex-1'}>
            {/* Organization Jobs */}
            {orgId && (
              <>
                {internalLoading ? (
                  <div className="space-y-5">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="bg-white rounded-xl shadow-md p-6 animate-pulse border border-gray-100"
                      >
                        <div className="h-7 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-3/4 mb-4"></div>
                        <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-1/2 mb-3"></div>
                        <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-2/3"></div>
                      </div>
                    ))}
                  </div>
                ) : internalJobs.length > 0 ? (
                  <div className="space-y-4">
                    {internalJobs.map((job) => (
                      <div
                        key={job.id}
                        className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-6 border border-gray-200"
                      >
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                          <div className="flex-1">
                            <h2 className="text-xl font-bold text-gray-900 mb-2">{job.title}</h2>
                            
                            <div className="flex flex-wrap gap-4 mb-3 text-sm text-gray-600">
                              <div className="flex items-center">
                                <Briefcase className="w-4 h-4 mr-1" />
                                <span className="font-medium">{job.level}</span>
                              </div>
                              <div className="flex items-center">
                                <MapPin className="w-4 h-4 mr-1" />
                                <span>{job.location}</span>
                              </div>
                              {job.remote && (
                                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                                  Remote
                                </span>
                              )}
                            </div>

                            {job.compensation && (job.compensation.min || job.compensation.max) && (
                              <div className="flex items-center text-sm text-green-600 font-semibold mb-3">
                                <DollarSign className="w-4 h-4 mr-1" />
                                <span>
                                  {job.compensation.min && job.compensation.max
                                    ? `${job.compensation.currency} ${job.compensation.min.toLocaleString()} - ${job.compensation.max.toLocaleString()}`
                                    : job.compensation.min
                                    ? `From ${job.compensation.currency} ${job.compensation.min.toLocaleString()}`
                                    : `Up to ${job.compensation.currency} ${job.compensation.max?.toLocaleString()}`}
                                </span>
                              </div>
                            )}

                            <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                              {job.description.length > 200
                                ? `${job.description.substring(0, 200)}...`
                                : job.description}
                            </p>

                            <div className="flex flex-wrap gap-2 mb-3">
                              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                                {job.type}
                              </span>
                              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                                Posted {formatDate(job.publishedAt)}
                              </span>
                            </div>
                          </div>

                          <div className="md:ml-4">
                            <a
                              href={`/jobs/${job.id}`}
                              className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors whitespace-nowrap"
                            >
                              View Details
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                    <Briefcase className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No open positions</h3>
                    <p className="text-gray-600 mb-6">
                      This company doesn't have any open positions at the moment.
                    </p>
                    <a
                      href="/jobs"
                      className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                    >
                      Browse All Jobs
                    </a>
                  </div>
                )}
              </>
            )}

            {/* Adzuna Jobs - Only show when not filtering by org */}
            {!orgId && (
              <>
                {adzunaError && (
                  <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl">
                    <p className="text-sm text-red-700 font-medium">{adzunaError}</p>
                  </div>
                )}

                {adzunaLoading ? (
                <div className="space-y-5">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="bg-white rounded-xl shadow-md p-6 animate-pulse border border-gray-100"
                    >
                      <div className="h-7 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-3/4 mb-4"></div>
                      <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-1/2 mb-3"></div>
                      <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-2/3"></div>
                    </div>
                  ))}
                </div>
            ) : adzunaJobs.length > 0 ? (
                <>
                  <div className="mb-6 text-sm font-medium text-gray-700 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 inline-block">
                    Found <span className="text-blue-600 font-bold">{adzunaTotalCount.toLocaleString()}</span> external jobs
                  </div>

                  <div className="space-y-4">
                    {adzunaJobs.map((job) => (
                      <div
                        key={job.id}
                        className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-6 border border-gray-200"
                      >
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                          <div className="flex-1">
                            <h2 className="text-xl font-bold text-gray-900 mb-2">{job.title}</h2>
                            
                            <div className="flex flex-wrap gap-4 mb-3 text-sm text-gray-600">
                              <div className="flex items-center">
                                <Briefcase className="w-4 h-4 mr-1" />
                                <span className="font-medium">{job.company}</span>
                              </div>
                              <div className="flex items-center">
                                <MapPin className="w-4 h-4 mr-1" />
                                <span>{job.location}</span>
                              </div>
                            </div>

                            <div className="flex items-center text-sm text-green-600 font-semibold mb-3">
                              <DollarSign className="w-4 h-4 mr-1" />
                              <span>{formatSalary(job)}</span>
                            </div>

                            <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                              {truncateDescription(job.description, 200)}
                            </p>

                            <div className="flex flex-wrap gap-2 mb-3">
                              {job.category && (
                                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                                  {job.category}
                                </span>
                              )}
                              {job.contract_type && (
                                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                                  {job.contract_type}
                                </span>
                              )}
                              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                                Posted {formatDate(job.created)}
                              </span>
                            </div>
                          </div>

                          <div className="md:ml-4">
                            <a
                              href={job.redirect_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors whitespace-nowrap"
                            >
                              Apply Now
                              <ExternalLink className="ml-2 w-4 h-4" />
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Adzuna Pagination */}
                  {adzunaJobs.length > 0 && (
                    <div className="mt-8 flex justify-center gap-2">
                      <button
                        onClick={() => searchAdzunaJobs(adzunaPage - 1)}
                        disabled={adzunaPage === 1 || adzunaLoading}
                        className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                      >
                        Previous
                      </button>
                      <span className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium">
                        Page {adzunaPage}
                      </span>
                      <button
                        onClick={() => searchAdzunaJobs(adzunaPage + 1)}
                        disabled={adzunaJobs.length < 10 || adzunaLoading}
                        className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
                ) : !adzunaLoading && !adzunaError ? (
                  <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                    <Search className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No jobs found</h3>
                    <p className="text-gray-600">
                      Try adjusting your search criteria or keywords
                    </p>
                  </div>
                ) : null}
              </>
            )}
        </main>
      </div>
    </div>
  );
}
