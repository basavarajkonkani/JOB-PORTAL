import { JobDetailSkeleton } from '@/components/LoadingSkeletons';

/**
 * Loading state for job detail page
 * Shown while the page is being loaded
 */
export default function Loading() {
  return <JobDetailSkeleton />;
}
