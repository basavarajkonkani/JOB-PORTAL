'use client';

import { useParams } from 'next/navigation';
import CandidateShortlist from '@/components/recruiter/CandidateShortlist';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function ApplicantsPage() {
  const params = useParams();
  const jobId = params.id as string;

  return (
    <ProtectedRoute allowedRoles={['recruiter']}>
      <CandidateShortlist jobId={jobId} />
    </ProtectedRoute>
  );
}
