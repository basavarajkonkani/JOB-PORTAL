'use client';

import { useState, useEffect } from 'react';
import JobFilters from './JobFilters';
import Pagination from './Pagination';
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
  const [internalPage, setInternalPage] = useState(1);
  const [internalTotalPages, setInternalTotalPages] = useState(1);
  const jobsPerPage = 10;
  
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
        const allJobs = jobsData.jobs || [];
        setInternalJobs(allJobs);
        setInternalTotalPages(Math.ceil(allJobs.length / jobsPerPage));
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
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <header className="mb-8">
        {orgId ? (
          <>
            <h1 className="job-page-title text-[32px] font-bold text-[#1A1A1A] mb-2 tracking-tight">
              {orgName ? `Jobs at ${orgName}` : 'Company Jobs'}
            </h1>
            <p className="text-[15px] text-[#6F6F6F] leading-relaxed">
              Explore open positions at this company
              {internalJobs.length > 0 && (
                <span className="ml-3 inline-flex items-center px-3 py-1 rounded-full text-[12px] font-medium bg-[#EFF6FF] text-[#2563EB] border border-[#2563EB]/10">
                  {internalJobs.length} {internalJobs.length === 1 ? 'position' : 'positions'} available
                </span>
              )}
            </p>
          </>
        ) : (
          <>
            <h1 className="job-page-title text-[32px] font-bold text-[#1A1A1A] mb-2 tracking-tight">Global Job Search</h1>
            <p className="text-[15px] text-[#6F6F6F] leading-relaxed">
              Search thousands of jobs from across India powered by Adzuna
              {adzunaTotalCount > 0 && (
                <span className="ml-3 inline-flex items-center px-3 py-1 rounded-full text-[12px] font-medium bg-[#EFF6FF] text-[#2563EB] border border-[#2563EB]/10">
                  {adzunaTotalCount.toLocaleString()} jobs available
                </span>
              )}
            </p>
          </>
        )}
      </header>

      <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar - Only show for global search */}
          {!orgId && (
            <aside className="lg:w-[280px] flex-shrink-0">
              <JobFilters filters={filters} onFilterChange={handleFilterChange} />
            </aside>
          )}

          {/* Job Results */}
          <main className={orgId ? 'w-full' : 'flex-1'}>
            {/* Organization Jobs */}
            {orgId && (
              <>
                {internalLoading ? (
                  <div className="space-y-6">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="bg-white rounded-2xl p-6 animate-pulse border border-[#E5E7EB]"
                      >
                        <div className="h-6 bg-[#F3F4F6] rounded w-3/4 mb-4"></div>
                        <div className="h-4 bg-[#F3F4F6] rounded w-1/2 mb-3"></div>
                        <div className="h-4 bg-[#F3F4F6] rounded w-2/3 mb-4"></div>
                        <div className="flex gap-2">
                          <div className="h-6 bg-[#F3F4F6] rounded-full w-16"></div>
                          <div className="h-6 bg-[#F3F4F6] rounded-full w-24"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : internalJobs.length > 0 ? (
                  <>
                  <div className="space-y-6">
                    {internalJobs
                      .slice((internalPage - 1) * jobsPerPage, internalPage * jobsPerPage)
                      .map((job) => (
                      <article
                        key={job.id}
                        className="job-card bg-white rounded-2xl p-6 border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.08)] hover:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1)] hover:border-[#2563EB] transition-all duration-200"
                      >
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5">
                          <div className="flex-1 min-w-0">
                            {/* Job Title */}
                            <h2 className="text-[24px] font-bold text-[#1A1A1A] mb-3 leading-tight tracking-[-0.01em] hover:text-[#2563EB] transition-colors line-clamp-2">{job.title}</h2>
                            
                            {/* Meta Info Row */}
                            <div className="flex flex-wrap items-center gap-3 mb-4">
                              <div className="flex items-center text-[14px] text-[#6F6F6F] font-medium">
                                <Briefcase className="w-4 h-4 mr-1.5 text-[#9CA3AF]" />
                                <span>{job.level}</span>
                              </div>
                              <span className="text-[#D1D5DB]">•</span>
                              <div className="flex items-center text-[14px] text-[#6F6F6F] font-medium">
                                <MapPin className="w-4 h-4 mr-1.5 text-[#9CA3AF]" />
                                <span>{job.location}</span>
                              </div>
                              {job.remote && (
                                <>
                                  <span className="text-[#D1D5DB]">•</span>
                                  <span className="px-2.5 py-1 bg-[#F0FDF4] text-[#16A34A] rounded-full text-[12px] font-medium border border-[#16A34A]/15">
                                    Remote
                                  </span>
                                </>
                              )}
                            </div>

                            {/* Salary */}
                            {job.compensation && (job.compensation.min || job.compensation.max) && (
                              <div className="flex items-center text-[15px] text-[#16A34A] font-semibold mb-4">
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

                            {/* Description */}
                            <p className="text-[15px] text-[#6F6F6F] mb-4 leading-[1.6] line-clamp-2">
                              {job.description}
                            </p>

                            {/* Tags */}
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="px-3 py-1.5 bg-[#EFF6FF] text-[#2563EB] rounded-full text-[12px] font-medium border border-[#2563EB]/10">
                                {job.type}
                              </span>
                              <span className="px-3 py-1.5 bg-[#F3F4F6] text-[#6F6F6F] rounded-full text-[12px] font-medium">
                                Posted {formatDate(job.publishedAt)}
                              </span>
                            </div>
                          </div>

                          {/* Apply Button */}
                          <div className="md:ml-4 flex-shrink-0 self-start md:self-center">
                            <a
                              href={`/jobs/${job.id}`}
                              className="inline-flex items-center justify-center bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[14px] font-semibold py-3 px-6 rounded-xl transition-all hover:shadow-lg whitespace-nowrap"
                            >
                              View Details
                            </a>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                  
                  {/* Internal Jobs Pagination */}
                  {internalJobs.length > jobsPerPage && (
                    <Pagination
                      currentPage={internalPage}
                      totalPages={internalTotalPages}
                      onPageChange={(page) => {
                        setInternalPage(page);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      isLoading={internalLoading}
                    />
                  )}
                  </>
                ) : (
                  <div className="bg-white rounded-2xl border border-[#E5E7EB] p-12 text-center">
                    <Briefcase className="w-14 h-14 mx-auto text-[#9CA3AF] mb-4" />
                    <h3 className="text-[18px] font-semibold text-[#1A1A1A] mb-2">No open positions</h3>
                    <p className="text-[15px] text-[#6F6F6F] mb-6 leading-relaxed">
                      This company doesn't have any open positions at the moment.
                    </p>
                    <a
                      href="/jobs"
                      className="inline-block bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[14px] font-semibold py-3 px-6 rounded-xl transition-all"
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
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-[14px] text-red-700 font-medium">{adzunaError}</p>
                  </div>
                )}

                {adzunaLoading ? (
                <div className="space-y-6">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="bg-white rounded-2xl p-6 animate-pulse border border-[#E5E7EB]"
                    >
                      <div className="h-6 bg-[#F3F4F6] rounded w-3/4 mb-4"></div>
                      <div className="h-4 bg-[#F3F4F6] rounded w-1/2 mb-3"></div>
                      <div className="h-4 bg-[#F3F4F6] rounded w-2/3 mb-4"></div>
                      <div className="flex gap-2">
                        <div className="h-6 bg-[#F3F4F6] rounded-full w-16"></div>
                        <div className="h-6 bg-[#F3F4F6] rounded-full w-24"></div>
                      </div>
                    </div>
                  ))}
                </div>
            ) : adzunaJobs.length > 0 ? (
                <>
                  <div className="mb-6 text-[14px] font-medium text-[#374151] bg-white px-4 py-2.5 rounded-lg shadow-sm border border-[#E5E7EB] inline-block">
                    Found <span className="text-[#2563EB] font-bold">{adzunaTotalCount.toLocaleString()}</span> external jobs
                  </div>

                  <div className="space-y-6">
                    {adzunaJobs.map((job) => (
                      <article
                        key={job.id}
                        className="job-card bg-white rounded-2xl p-6 border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.08)] hover:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1)] hover:border-[#2563EB] transition-all duration-200"
                      >
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5">
                          <div className="flex-1 min-w-0">
                            {/* Job Title */}
                            <h2 className="text-[24px] font-bold text-[#1A1A1A] mb-3 leading-tight tracking-[-0.01em] hover:text-[#2563EB] transition-colors line-clamp-2">{job.title}</h2>
                            
                            {/* Meta Info Row */}
                            <div className="flex flex-wrap items-center gap-3 mb-4">
                              <div className="flex items-center text-[14px] text-[#6F6F6F] font-medium">
                                <Briefcase className="w-4 h-4 mr-1.5 text-[#9CA3AF]" />
                                <span>{job.company}</span>
                              </div>
                              <span className="text-[#D1D5DB]">•</span>
                              <div className="flex items-center text-[14px] text-[#6F6F6F] font-medium">
                                <MapPin className="w-4 h-4 mr-1.5 text-[#9CA3AF]" />
                                <span>{job.location}</span>
                              </div>
                            </div>

                            {/* Salary */}
                            <div className="flex items-center text-[15px] text-[#16A34A] font-semibold mb-4">
                              <DollarSign className="w-4 h-4 mr-1" />
                              <span>{formatSalary(job)}</span>
                            </div>

                            {/* Description */}
                            <p className="text-[15px] text-[#6F6F6F] mb-4 leading-[1.6] line-clamp-2">
                              {truncateDescription(job.description, 200)}
                            </p>

                            {/* Tags */}
                            <div className="flex flex-wrap items-center gap-2">
                              {job.category && (
                                <span className="px-3 py-1.5 bg-[#EFF6FF] text-[#2563EB] rounded-full text-[12px] font-medium border border-[#2563EB]/10">
                                  {job.category}
                                </span>
                              )}
                              {job.contract_type && (
                                <span className="px-3 py-1.5 bg-[#FAF5FF] text-[#7C3AED] rounded-full text-[12px] font-medium border border-[#7C3AED]/10">
                                  {job.contract_type}
                                </span>
                              )}
                              <span className="px-3 py-1.5 bg-[#F3F4F6] text-[#6F6F6F] rounded-full text-[12px] font-medium">
                                Posted {formatDate(job.created)}
                              </span>
                            </div>
                          </div>

                          {/* Apply Button */}
                          <div className="md:ml-4 flex-shrink-0 self-start md:self-center">
                            <a
                              href={job.redirect_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[14px] font-semibold py-3 px-6 rounded-xl transition-all hover:shadow-lg whitespace-nowrap"
                            >
                              Apply Now
                              <ExternalLink className="ml-2 w-4 h-4" />
                            </a>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>

                  {/* Adzuna Pagination */}
                  {adzunaJobs.length > 0 && adzunaTotalCount > 10 && (
                    <Pagination
                      currentPage={adzunaPage}
                      totalPages={Math.ceil(adzunaTotalCount / 10)}
                      onPageChange={(page) => {
                        searchAdzunaJobs(page);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      isLoading={adzunaLoading}
                    />
                  )}
                </>
                ) : !adzunaLoading && !adzunaError ? (
                  <div className="bg-white rounded-2xl border border-[#E5E7EB] p-12 text-center">
                    <Search className="w-14 h-14 mx-auto text-[#9CA3AF] mb-4" />
                    <h3 className="text-[18px] font-semibold text-[#1A1A1A] mb-2">No jobs found</h3>
                    <p className="text-[15px] text-[#6F6F6F] leading-relaxed">
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
