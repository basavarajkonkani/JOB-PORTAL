'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import CandidateProfile from '@/components/profile/CandidateProfile';
import RecruiterProfile from '@/components/profile/RecruiterProfile';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function ProfilePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/signin');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {user?.role === 'candidate' && <CandidateProfile />}
        {user?.role === 'recruiter' && <RecruiterProfile />}
      </div>
    </ProtectedRoute>
  );
}
