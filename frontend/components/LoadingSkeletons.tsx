'use client';

/**
 * Loading skeleton components for async content
 * Improves perceived performance by showing placeholders
 */

export function JobCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 animate-pulse">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="flex gap-2">
            <div className="h-4 bg-gray-200 rounded w-24"></div>
            <div className="h-4 bg-gray-200 rounded w-32"></div>
          </div>
        </div>
        <div className="flex gap-2 ml-4">
          <div className="w-9 h-9 bg-gray-200 rounded"></div>
          <div className="w-9 h-9 bg-gray-200 rounded"></div>
        </div>
      </div>
      <div className="space-y-2 mb-3">
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex gap-3">
          <div className="h-6 bg-gray-200 rounded w-20"></div>
          <div className="h-6 bg-gray-200 rounded w-32"></div>
        </div>
        <div className="h-4 bg-gray-200 rounded w-24"></div>
      </div>
    </div>
  );
}

export function JobDetailSkeleton() {
  return (
    <div className="max-w-4xl mx-auto p-6 animate-pulse">
      {/* Hero image skeleton */}
      <div className="w-full h-64 bg-gray-200 rounded-lg mb-6"></div>

      {/* Title and metadata */}
      <div className="mb-6">
        <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="flex gap-4 mb-4">
          <div className="h-5 bg-gray-200 rounded w-32"></div>
          <div className="h-5 bg-gray-200 rounded w-40"></div>
          <div className="h-5 bg-gray-200 rounded w-24"></div>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-3 mb-6">
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      </div>

      {/* Requirements */}
      <div className="mb-6">
        <div className="h-6 bg-gray-200 rounded w-40 mb-3"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-4/5"></div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-4">
        <div className="h-12 bg-gray-200 rounded w-32"></div>
        <div className="h-12 bg-gray-200 rounded w-32"></div>
      </div>
    </div>
  );
}

export function ApplicationCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 animate-pulse">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="h-6 bg-gray-200 rounded w-2/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="h-6 bg-gray-200 rounded-full w-24"></div>
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="max-w-7xl mx-auto p-6 animate-pulse">
      {/* Header */}
      <div className="mb-8">
        <div className="h-8 bg-gray-200 rounded w-64 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-96"></div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="h-4 bg-gray-200 rounded w-24 mb-3"></div>
            <div className="h-8 bg-gray-200 rounded w-16"></div>
          </div>
        ))}
      </div>

      {/* Content sections */}
      <div className="space-y-6">
        <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <JobCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="max-w-4xl mx-auto p-6 animate-pulse">
      <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-200">
        {/* Header */}
        <div className="flex items-center gap-6 mb-8">
          <div className="w-24 h-24 bg-gray-200 rounded-full"></div>
          <div className="flex-1">
            <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-64"></div>
          </div>
        </div>

        {/* Form fields */}
        <div className="space-y-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i}>
              <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
              <div className="h-10 bg-gray-200 rounded w-full"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
