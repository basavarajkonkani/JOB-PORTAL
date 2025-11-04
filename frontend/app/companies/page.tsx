import Navbar from '@/components/layout/Navbar';

export default function CompaniesPage() {
  const companies = [
    {
      id: 1,
      name: 'TechCorp',
      logo: '🏢',
      jobs: 45,
      industry: 'Technology',
      location: 'San Francisco, CA',
    },
    {
      id: 2,
      name: 'DataSystems',
      logo: '💻',
      jobs: 32,
      industry: 'Software',
      location: 'New York, NY',
    },
    {
      id: 3,
      name: 'CloudWorks',
      logo: '☁️',
      jobs: 28,
      industry: 'Cloud Services',
      location: 'Seattle, WA',
    },
    {
      id: 4,
      name: 'AI Innovations',
      logo: '🤖',
      jobs: 56,
      industry: 'Artificial Intelligence',
      location: 'Austin, TX',
    },
    {
      id: 5,
      name: 'FinTech Solutions',
      logo: '💰',
      jobs: 41,
      industry: 'Finance',
      location: 'Boston, MA',
    },
    {
      id: 6,
      name: 'HealthTech',
      logo: '🏥',
      jobs: 23,
      industry: 'Healthcare',
      location: 'Chicago, IL',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Top Companies Hiring
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover leading companies and explore career opportunities
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((company) => (
            <div
              key={company.id}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 p-6 border border-gray-100"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="text-5xl">{company.logo}</div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{company.name}</h3>
                  <p className="text-sm text-gray-600">{company.industry}</p>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  {company.location}
                </div>
                <div className="flex items-center gap-2 text-sm text-blue-600 font-medium">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  {company.jobs} open positions
                </div>
              </div>

              <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2.5 rounded-lg hover:from-blue-700 hover:to-indigo-700 font-medium transition-all shadow-md hover:shadow-lg">
                View Jobs
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
