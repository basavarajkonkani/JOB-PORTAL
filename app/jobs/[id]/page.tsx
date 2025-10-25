import JobDetailPage from '@/components/jobs/JobDetailPage';

interface PageProps {
  params: {
    id: string;
  };
}

export default function JobPage({ params }: PageProps) {
  return <JobDetailPage jobId={params.id} />;
}
