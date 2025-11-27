'use client';

import { useState, useEffect } from 'react';

interface Filters {
  title: string;
  level: string;
  location: string;
  remote: boolean | null;
}

interface JobFiltersProps {
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
}

export default function JobFilters({ filters, onFilterChange }: JobFiltersProps) {
  const [localFilters, setLocalFilters] = useState<Filters>(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleInputChange = (field: keyof Filters, value: string | boolean | null) => {
    const newFilters = { ...localFilters, [field]: value };
    setLocalFilters(newFilters);
  };

  const handleApplyFilters = () => {
    onFilterChange(localFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters = { title: '', level: '', location: '', remote: null };
    setLocalFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  const hasActiveFilters =
    localFilters.title ||
    localFilters.level ||
    localFilters.location ||
    localFilters.remote !== null;

  return (
    <div className="filter-container bg-white rounded-xl p-5 sticky top-4 border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-[18px] font-semibold text-[#1A1A1A] flex items-center tracking-tight">
          <svg
            className="w-5 h-5 mr-2 text-[#2563EB]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
          Filters
        </h3>
        {hasActiveFilters && (
          <span className="bg-[#EFF6FF] text-[#2563EB] text-[12px] font-medium px-2.5 py-1 rounded-full border border-[#2563EB]/10">
            Active
          </span>
        )}
      </div>

      <div className="space-y-4">
        {/* Title Search */}
        <div>
          <label htmlFor="title" className="filter-label block text-[14px] font-semibold text-[#1A1A1A] mb-1.5">
            Job Title
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-4 w-4 text-[#9CA3AF]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              id="title"
              type="text"
              value={localFilters.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="e.g. Software Engineer"
              className="filter-input w-full pl-9 pr-3 py-2.5 border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] text-[14px] text-[#374151] transition-all placeholder:text-[#9CA3AF]"
            />
          </div>
        </div>

        {/* Level Filter */}
        <div>
          <label htmlFor="level" className="filter-label block text-[14px] font-semibold text-[#1A1A1A] mb-1.5">
            Experience Level
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-4 w-4 text-[#9CA3AF]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                />
              </svg>
            </div>
            <select
              id="level"
              value={localFilters.level}
              onChange={(e) => handleInputChange('level', e.target.value)}
              className="filter-input w-full pl-9 pr-8 py-2.5 border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] text-[14px] text-[#374151] appearance-none bg-white transition-all cursor-pointer"
            >
              <option value="">All Levels</option>
              <option value="entry">Entry Level</option>
              <option value="mid">Mid Level</option>
              <option value="senior">Senior</option>
              <option value="lead">Lead</option>
              <option value="executive">Executive</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <svg
                className="h-4 w-4 text-[#9CA3AF]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Location Filter */}
        <div>
          <label htmlFor="location" className="filter-label block text-[14px] font-semibold text-[#1A1A1A] mb-1.5">
            Location
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-4 w-4 text-[#9CA3AF]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
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
            </div>
            <input
              id="location"
              type="text"
              value={localFilters.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="e.g. San Francisco"
              className="filter-input w-full pl-9 pr-3 py-2.5 border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] text-[14px] text-[#374151] transition-all placeholder:text-[#9CA3AF]"
            />
          </div>
        </div>

        {/* Remote Filter */}
        <div>
          <label className="filter-label block text-[14px] font-semibold text-[#1A1A1A] mb-2">Work Type</label>
          <div className="space-y-2">
            <label className="flex items-center p-2.5 border border-[#E5E7EB] rounded-lg hover:bg-[#F9FAFB] cursor-pointer transition-colors">
              <input
                type="radio"
                name="remote"
                checked={localFilters.remote === null}
                onChange={() => handleInputChange('remote', null)}
                className="mr-2.5 text-[#2563EB] focus:ring-[#2563EB] w-4 h-4"
              />
              <span className="text-[14px] font-medium text-[#374151]">All Types</span>
            </label>
            <label className="flex items-center p-2.5 border border-[#E5E7EB] rounded-lg hover:bg-[#F9FAFB] cursor-pointer transition-colors">
              <input
                type="radio"
                name="remote"
                checked={localFilters.remote === true}
                onChange={() => handleInputChange('remote', true)}
                className="mr-2.5 text-[#2563EB] focus:ring-[#2563EB] w-4 h-4"
              />
              <div className="flex items-center">
                <svg
                  className="w-4 h-4 text-[#16A34A] mr-1.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-[14px] font-medium text-[#374151]">Remote Only</span>
              </div>
            </label>
            <label className="flex items-center p-2.5 border border-[#E5E7EB] rounded-lg hover:bg-[#F9FAFB] cursor-pointer transition-colors">
              <input
                type="radio"
                name="remote"
                checked={localFilters.remote === false}
                onChange={() => handleInputChange('remote', false)}
                className="mr-2.5 text-[#2563EB] focus:ring-[#2563EB] w-4 h-4"
              />
              <div className="flex items-center">
                <svg className="w-4 h-4 text-[#2563EB] mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm3 1h6v4H7V5zm6 6H7v2h6v-2z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-[14px] font-medium text-[#374151]">On-site</span>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-5 space-y-2.5">
        <button
          onClick={handleApplyFilters}
          className="job-apply-btn w-full bg-[#2563EB] text-white py-2.5 px-4 rounded-lg hover:bg-[#1D4ED8] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 text-[14px] font-semibold transition-all"
        >
          Apply Filters
        </button>
        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="w-full bg-white text-[#374151] py-2.5 px-4 rounded-lg border border-[#D1D5DB] hover:bg-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 text-[14px] font-medium transition-all"
          >
            Clear All Filters
          </button>
        )}
      </div>
    </div>
  );
}
