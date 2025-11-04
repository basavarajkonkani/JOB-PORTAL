import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white">
      <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,transparent,black)]"></div>
      <div className="absolute top-0 right-0 -mt-32 -mr-32 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 -mb-32 -ml-32 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
      
      <div className="relative max-w-container mx-auto px-6 sm:px-8 lg:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-xl font-bold">AI Job Portal</span>
            </div>
            <p className="text-blue-100 text-sm leading-relaxed">
              Empowering careers with AI-driven job matching, intelligent resume building, and personalized career guidance.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white mb-6">For Candidates</h3>
            <ul className="space-y-3">
              <li><Link href="/jobs" className="text-blue-100 hover:text-white transition-colors text-sm">Browse Jobs</Link></li>
              <li><Link href="/resume" className="text-blue-100 hover:text-white transition-colors text-sm">AI Resume Builder</Link></li>
              <li><Link href="/applications" className="text-blue-100 hover:text-white transition-colors text-sm">My Applications</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white mb-6">For Employers</h3>
            <ul className="space-y-3">
              <li><Link href="/employers" className="text-blue-100 hover:text-white transition-colors text-sm">Post a Job</Link></li>
              <li><Link href="/companies" className="text-blue-100 hover:text-white transition-colors text-sm">Browse Companies</Link></li>
              <li><Link href="/dashboard" className="text-blue-100 hover:text-white transition-colors text-sm">Recruiter Dashboard</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white mb-6">Company</h3>
            <ul className="space-y-3">
              <li><Link href="/about" className="text-blue-100 hover:text-white transition-colors text-sm">About Us</Link></li>
              <li><Link href="/contact" className="text-blue-100 hover:text-white transition-colors text-sm">Contact</Link></li>
              <li><Link href="/privacy" className="text-blue-100 hover:text-white transition-colors text-sm">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8">
          <p className="text-blue-100 text-sm text-center">© 2025 AI Job Portal. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
