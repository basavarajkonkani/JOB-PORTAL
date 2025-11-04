'use client';

import { useState, useEffect } from 'react';
import { Search, MapPin, Briefcase, DollarSign, ExternalLink, Loader2 } from 'lucide-react';

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

interface AdzunaSearchResponse {
  success: boolean;
  count: number;
  results: AdzunaJob[];
  page: number;
  results_per_page: number;
  error?: string;
}

export default function AdzunaJobSearch() {
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [jobs, setJobs] = useState<AdzunaJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasSearched, setHasSearched] = useState(false);

  const searchJobs = async (page: number = 1) => {
    if (!keyword.trim()) {
      setError('Please enter a job title or keyword');
      return;
    }

    setLoading(true);
    setError('');
    setHasSearched(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const params = new URLSearchParams({
        what: keyword.trim(),
        ...(location.trim() && { where: location.trim() }),
        results_per_page: '10',
        page: page.toString(),
      });

      const response = await fetch(`${apiUrl}/api/adzuna/search?${params.toString()}`);
      const data: AdzunaSearchResponse = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch jobs');
      }

      setJobs(data.results);
      setTotalCount(data.count);
      setCurrentPage(page);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch jobs. Please try again.');
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchJobs(1);
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          Find Your Next Opportunity
        </h1>
        <p className="text-lg text-gray-600">
          Search thousands of jobs from across India powered by Adzuna
        </p>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Job title or keyword (e.g., developer, designer)"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Location (e.g., Bangalore, Mumbai)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin mr-2 w-5 h-5" />
                Searching...
              </>
            ) : (
              <>
                <Search className="mr-2 w-5 h-5" />
                Search Jobs
              </>
            )}
          </button>
        </div>
      </form>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Results Count */}
      {hasSearched && !loading && !error && (
        <div className="mb-6">
          <p className="text-gray-700 text-lg">
            Found <span className="font-semibold">{totalCount.toLocaleString()}</span> jobs
            {keyword && ` for "${keyword}"`}
            {location && ` in ${location}`}
          </p>
        </div>
      )}

      {/* Job Listings */}
      <div className="space-y-4">
        {jobs.map((job) => (
          <div
            key={job.id}
            className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-6 border border-gray-200"
          >
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{job.title}</h2>
                
                <div className="flex flex-wrap gap-4 mb-3 text-gray-600">
                  <div className="flex items-center">
                    <Briefcase className="w-4 h-4 mr-1" />
                    <span className="font-medium">{job.company}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span>{job.location}</span>
                  </div>
                </div>

                <div className="flex items-center text-green-600 font-semibold mb-3">
                  <DollarSign className="w-4 h-4 mr-1" />
                  <span>{formatSalary(job)}</span>
                </div>

                <p className="text-gray-700 mb-4 leading-relaxed">
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

      {/* No Results */}
      {hasSearched && !loading && jobs.length === 0 && !error && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Search className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No jobs found</h3>
          <p className="text-gray-600">
            Try adjusting your search criteria or keywords
          </p>
        </div>
      )}

      {/* Pagination */}
      {jobs.length > 0 && (
        <div className="mt-8 flex justify-center gap-2">
          <button
            onClick={() => searchJobs(currentPage - 1)}
            disabled={currentPage === 1 || loading}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            Previous
          </button>
          <span className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium">
            Page {currentPage}
          </span>
          <button
            onClick={() => searchJobs(currentPage + 1)}
            disabled={jobs.length < 10 || loading}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
