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
    <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>

      <div className="space-y-4">
        {/* Title Search */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Job Title
          </label>
          <input
            id="title"
            type="text"
            value={localFilters.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="e.g. Software Engineer"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>

        {/* Level Filter */}
        <div>
          <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-1">
            Experience Level
          </label>
          <select
            id="level"
            value={localFilters.level}
            onChange={(e) => handleInputChange('level', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="">All Levels</option>
            <option value="entry">Entry Level</option>
            <option value="mid">Mid Level</option>
            <option value="senior">Senior</option>
            <option value="lead">Lead</option>
            <option value="executive">Executive</option>
          </select>
        </div>

        {/* Location Filter */}
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
            Location
          </label>
          <input
            id="location"
            type="text"
            value={localFilters.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
            placeholder="e.g. San Francisco"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>

        {/* Remote Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Work Type</label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="remote"
                checked={localFilters.remote === null}
                onChange={() => handleInputChange('remote', null)}
                className="mr-2 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">All</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="remote"
                checked={localFilters.remote === true}
                onChange={() => handleInputChange('remote', true)}
                className="mr-2 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Remote Only</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="remote"
                checked={localFilters.remote === false}
                onChange={() => handleInputChange('remote', false)}
                className="mr-2 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">On-site</span>
            </label>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 space-y-2">
        <button
          onClick={handleApplyFilters}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
        >
          Apply Filters
        </button>
        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="w-full bg-white text-gray-700 py-2 px-4 rounded-md border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
          >
            Clear All
          </button>
        )}
      </div>
    </div>
  );
}
