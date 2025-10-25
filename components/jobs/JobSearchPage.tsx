'use client';

import { useState, useEffect } from 'react';
import JobCard from './JobCard';
import JobFilters from './JobFilters';

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

export default function JobSearchPage() {
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [filters, setFilters] = useState<Filters>({
    title: '',
    level: '',
    location: '',
    remote: null,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    searchJobs();
  }, [currentPage, filters]);

  const searchJobs = async () => {
    setIsLoading(true);
    setError('');

    try {
      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      params.append('limit', '20');

      if (filters.title) params.append('title', filters.title);
      if (filters.level) params.append('level', filters.level);
      if (filters.location) params.append('location', filters.location);
      if (filters.remote !== null) params.append('remote', filters.remote.toString());

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/jobs?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error('Failed to search jobs');
      }

      const data = await response.json();
      setSearchResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search jobs');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (newFilters: Filters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Find Your Next Opportunity</h1>
          <p className="mt-2 text-gray-600">
            Discover jobs that match your skills and preferences
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            <JobFilters filters={filters} onFilterChange={handleFilterChange} />
          </aside>

          {/* Job Results */}
          <main className="flex-1">
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-lg shadow-sm p-6 animate-pulse"
                  >
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : searchResult && searchResult.jobs.length > 0 ? (
              <>
                <div className="mb-4 text-sm text-gray-600">
                  Found {searchResult.total} {searchResult.total === 1 ? 'job' : 'jobs'}
                </div>

                <div className="space-y-4">
                  {searchResult.jobs.map((job) => (
                    <JobCard key={job.id} job={job} />
                  ))}
                </div>

                {/* Pagination */}
                {searchResult.totalPages > 1 && (
                  <div className="mt-8 flex justify-center items-center gap-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>

                    <div className="flex gap-1">
                      {[...Array(searchResult.totalPages)].map((_, i) => {
                        const page = i + 1;
                        // Show first, last, current, and adjacent pages
                        if (
                          page === 1 ||
                          page === searchResult.totalPages ||
                          (page >= currentPage - 1 && page <= currentPage + 1)
                        ) {
                          return (
                            <button
                              key={page}
                              onClick={() => handlePageChange(page)}
                              className={`px-4 py-2 border rounded-md text-sm font-medium ${
                                page === currentPage
                                  ? 'bg-blue-600 text-white border-blue-600'
                                  : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                              }`}
                            >
                              {page}
                            </button>
                          );
                        } else if (
                          page === currentPage - 2 ||
                          page === currentPage + 2
                        ) {
                          return (
                            <span key={page} className="px-2 py-2 text-gray-500">
                              ...
                            </span>
                          );
                        }
                        return null;
                      })}
                    </div>

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === searchResult.totalPages}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <p className="text-gray-600">No jobs found matching your criteria.</p>
                <button
                  onClick={() => {
                    setFilters({ title: '', level: '', location: '', remote: null });
                    setCurrentPage(1);
                  }}
                  className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                >
                  Clear filters
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
