'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import RecruiterDashboard from '@/components/recruiter/RecruiterDashboard';
import JDWizard from '@/components/recruiter/JDWizard';

export default function RecruiterPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [showWizard, setShowWizard] = useState(false);

  // Redirect if not authenticated or not a recruiter
  React.useEffect(() => {
    if (!isLoading && (!user || user.role !== 'recruiter')) {
      router.push('/signin');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user || user.role !== 'recruiter') {
    return null;
  }

  const handleJobCreated = (jobId: string) => {
    setShowWizard(false);
    router.push(`/jobs/${jobId}`);
  };

  const handleCancelWizard = () => {
    setShowWizard(false);
  };

  const handleCreateJob = () => {
    setShowWizard(true);
  };

  if (showWizard) {
    return <JDWizard onJobCreated={handleJobCreated} onCancel={handleCancelWizard} />;
  }

  return <RecruiterDashboard onCreateJob={handleCreateJob} />;
}
