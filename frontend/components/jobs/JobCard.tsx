'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

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

interface JobCardProps {
  job: Job;
}

export default function JobCard({ job }: JobCardProps) {
  const router = useRouter();
  const [isSaved, setIsSaved] = useState(false);

  const formatLevel = (level: string) => {
    const levelMap: Record<string, string> = {
      entry: 'Entry Level',
      mid: 'Mid Level',
      senior: 'Senior',
      lead: 'Lead',
      executive: 'Executive',
    };
    return levelMap[level] || level;
  };

  const formatCompensation = () => {
    const { min, max, currency } = job.compensation;
    if (!min && !max) return null;

    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });

    if (min && max) {
      return `${formatter.format(min)} - ${formatter.format(max)}`;
    } else if (min) {
      return `From ${formatter.format(min)}`;
    } else if (max) {
      return `Up to ${formatter.format(max)}`;
    }
    return null;
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSaved(!isSaved);
    // Save functionality will be implemented with backend API
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/jobs/${job.id}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: job.title,
          text: `Check out this job: ${job.title}`,
          url,
        });
      } catch (err) {
        // User cancelled or share failed
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    }
  };

  const handleCardClick = () => {
    router.push(`/jobs/${job.id}`);
  };

  const compensation = formatCompensation();

  return (
    <article
      onClick={handleCardClick}
      className="job-card bg-white rounded-2xl p-6 cursor-pointer border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.08)] hover:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1)] hover:border-[#2563EB] hover:-translate-y-0.5 group transition-all duration-200"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1 min-w-0">
          {/* Job Title */}
          <h3 className="job-card-title text-[24px] font-bold text-[#1A1A1A] group-hover:text-[#2563EB] mb-3 transition-colors leading-tight tracking-[-0.01em] line-clamp-2">
            {job.title}
          </h3>
          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-3 text-[14px] text-[#6F6F6F]">
            <span className="flex items-center font-medium">
              <svg className="w-4 h-4 mr-1.5 text-[#9CA3AF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              {formatLevel(job.level)}
            </span>
            <span className="text-[#D1D5DB]">•</span>
            <span className="flex items-center font-medium">
              <svg className="w-4 h-4 mr-1.5 text-[#9CA3AF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              {job.location}
            </span>
            {job.remote && (
              <>
                <span className="text-[#D1D5DB]">•</span>
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[12px] font-medium bg-[#F0FDF4] text-[#16A34A] border border-[#16A34A]/15">
                  Remote
                </span>
              </>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-1.5 ml-4 flex-shrink-0">
          <button
            onClick={handleSave}
            className="p-2 text-[#9CA3AF] hover:text-[#2563EB] hover:bg-[#EFF6FF] rounded-lg transition-all"
            aria-label={isSaved ? 'Unsave job' : 'Save job'}
          >
            <svg
              className="w-5 h-5"
              fill={isSaved ? 'currentColor' : 'none'}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
              />
            </svg>
          </button>
          <button
            onClick={handleShare}
            className="p-2 text-[#9CA3AF] hover:text-[#2563EB] hover:bg-[#EFF6FF] rounded-lg transition-all"
            aria-label="Share job"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Description */}
      <p className="job-body-text text-[#6F6F6F] text-[15px] mb-4 line-clamp-2 leading-[1.6]">{job.description}</p>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-[#F3F4F6]">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="job-tag job-tag-primary inline-flex items-center px-3 py-1.5 rounded-full text-[12px] font-medium bg-[#EFF6FF] text-[#2563EB] border border-[#2563EB]/10">
            {job.type}
          </span>
          {compensation && (
            <span className="job-salary flex items-center text-[#16A34A] font-semibold text-[15px]">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {compensation}
            </span>
          )}
        </div>
        <button
          onClick={handleCardClick}
          className="text-[#2563EB] hover:text-[#1D4ED8] text-[14px] font-semibold flex items-center gap-1 group-hover:gap-1.5 transition-all"
        >
          View Details
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </article>
  );
}
