'use client';

import Link from 'next/link';
import JobSearchPage from '@/components/jobs/JobSearchPage';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Navbar />

      {/* Hero Section - Professional Internshala-Style Design */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16 sm:py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            {/* Left Content */}
            <div className="text-left animate-fade-in-up">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-semibold mb-6 shadow-lg">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                AI-Powered Job Matching
              </div>

              {/* Main Heading */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                India's <span className="text-yellow-300">#1</span> AI-powered
                <br />
                job portal for professionals
              </h1>

              {/* Subheading */}
              <p className="text-lg sm:text-xl text-white mb-8 leading-relaxed max-w-xl opacity-100" style={{ color: '#ffffff' }}>
                Discover personalized job recommendations, create AI-enhanced resumes, and connect with top employers. Let artificial intelligence accelerate your career journey.
              </p>

              {/* CTA Buttons with Enhanced Hover Effects */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link
                  href="/signup"
                  className="h-14 px-8 flex items-center justify-center bg-white text-blue-600 text-base font-semibold rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                >
                  Get Started Free
                </Link>
                <Link
                  href="#features"
                  className="h-14 px-8 flex items-center justify-center bg-transparent text-white text-base font-semibold rounded-lg border-2 border-white hover:bg-white hover:text-blue-600 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Learn More
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center gap-6 text-white text-sm font-medium">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span>10K+ Jobs</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>5K+ Companies</span>
                </div>
              </div>
            </div>

            {/* Right Image */}
            <div className="relative lg:block hidden animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="relative">
                {/* Decorative Elements */}
                <div className="absolute -top-6 -right-6 w-72 h-72 bg-yellow-400/20 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-6 -left-6 w-64 h-64 bg-purple-400/20 rounded-full blur-3xl"></div>

                {/* Main Image Container */}
                <div className="relative bg-white/10 backdrop-blur-sm rounded-3xl p-2 shadow-2xl border border-white/20">
                  <img
                    src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop&q=80"
                    alt="Diverse team of professionals collaborating with laptops"
                    className="w-full h-auto rounded-2xl shadow-xl object-cover"
                    loading="eager"
                  />
                </div>

                {/* Floating Stats Card */}
                <div className="absolute -bottom-8 -left-8 bg-white rounded-2xl p-6 shadow-2xl animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">98%</p>
                      <p className="text-sm text-gray-600">Success Rate</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Image - Smaller and Below Content */}
            <div className="lg:hidden relative animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl p-2 shadow-xl border border-white/20">
                <img
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=400&fit=crop&q=80"
                  alt="Diverse team of professionals collaborating with laptops"
                  className="w-full h-auto rounded-xl shadow-lg object-cover"
                  loading="eager"
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Feature Cards Section */}
      <section className="py-16 lg:py-20 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div id="features" className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Link
              href="/resume"
              className="group bg-white/90 backdrop-blur-sm p-10 rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-2 border border-gray-100 cursor-pointer animate-fade-in-up"
              style={{ animationDelay: '0.3s' }}
            >
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">AI Resume Builder</h3>
              <p className="text-gray-600 leading-relaxed text-base">
                Upload your resume and let AI enhance it with industry-specific keywords and
                compelling descriptions that pass ATS systems.
              </p>
            </Link>

            <Link
              href="/dashboard"
              className="group bg-white/90 backdrop-blur-sm p-10 rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-2 border border-gray-100 cursor-pointer animate-fade-in-up"
              style={{ animationDelay: '0.4s' }}
            >
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Smart Job Matching</h3>
              <p className="text-gray-600 leading-relaxed text-base">
                Get personalized job recommendations based on your skills, experience, and career
                goals powered by advanced AI algorithms.
              </p>
            </Link>

            <Link
              href="/applications"
              className="group bg-white/90 backdrop-blur-sm p-10 rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-2 border border-gray-100 cursor-pointer animate-fade-in-up"
              style={{ animationDelay: '0.5s' }}
            >
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">AI Cover Letters</h3>
              <p className="text-gray-600 leading-relaxed text-base">
                Generate tailored cover letters for each application that highlight your relevant
                experience and match the job requirements.
              </p>
            </Link>
          </div>
        </div>
      </section>

      {/* Main Content - Job Search */}
      <main id="main-content" className="py-16 lg:py-20">
        <div className="max-w-container mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Explore Open Positions</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Browse thousands of opportunities from top companies worldwide
            </p>
          </div>
          <JobSearchPage />
        </div>
      </main>

      <Footer />
    </div>
  );
}
