'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Search, Briefcase, Building2, Sparkles, Menu, X } from 'lucide-react';

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/jobs`;
      sessionStorage.setItem('jobSearchQuery', searchQuery);
    }
  };

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled
      ? 'bg-white/95 backdrop-blur-xl shadow-lg border-b border-gray-200'
      : 'bg-white/90 backdrop-blur-md border-b border-gray-100'
      }`}>
      <nav className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand - Premium Design */}
          <Link href="/" className="flex items-center gap-3 flex-shrink-0 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl blur-md opacity-40 group-hover:opacity-60 transition-opacity"></div>
              <div className="relative w-12 h-12 bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
                <Briefcase className="w-6 h-6 text-white" strokeWidth={2.5} />
              </div>
            </div>
            <div className="hidden sm:block">
              <span className="text-xl font-black bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent font-display">
                AI Job Portal
              </span>
              <p className="text-xs text-gray-600 font-semibold -mt-1">Powered by Intelligence</p>
            </div>
          </Link>

          {/* Desktop Navigation Links - Premium */}
          <div className="hidden lg:flex items-center gap-2 ml-12">
            <Link
              href="/jobs"
              className="px-5 py-2.5 text-sm font-bold text-gray-700 hover:text-blue-600 rounded-xl hover:bg-blue-50 transition-all duration-200 relative group"
            >
              <span>Jobs</span>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 group-hover:w-3/4 transition-all duration-300"></div>
            </Link>
            <Link
              href="/companies"
              className="px-5 py-2.5 text-sm font-bold text-gray-700 hover:text-indigo-600 rounded-xl hover:bg-indigo-50 transition-all duration-200 relative group"
            >
              <span>Companies</span>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-indigo-600 to-violet-600 group-hover:w-3/4 transition-all duration-300"></div>
            </Link>
            <Link
              href="/services"
              className="px-5 py-2.5 text-sm font-bold text-gray-700 hover:text-violet-600 rounded-xl hover:bg-violet-50 transition-all duration-200 relative group"
            >
              <span>Services</span>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-violet-600 to-purple-600 group-hover:w-3/4 transition-all duration-300"></div>
            </Link>
          </div>

          {/* Premium Search Bar - Desktop */}
          <form onSubmit={handleSearch} className="hidden lg:flex items-center flex-1 max-w-md mx-8">
            <div className="relative w-full group">
              <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none group-focus-within:text-blue-600 transition-colors" />
              <input
                type="text"
                placeholder="Search jobs, companies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 pl-11 pr-4 text-sm text-gray-900 placeholder-gray-500 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200 font-medium"
              />
            </div>
          </form>

          {/* Auth Buttons - Desktop - Premium Design */}
          <div className="hidden lg:flex items-center gap-3 flex-shrink-0">
            <Link
              href="/signin"
              className="h-11 px-6 flex items-center justify-center text-sm font-bold text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all duration-200 border border-gray-200 hover:border-gray-300"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="relative h-11 px-6 flex items-center justify-center text-sm font-bold text-white rounded-xl overflow-hidden group shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 transition-transform duration-300 group-hover:scale-105"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative z-10">Get Started</span>
            </Link>
          </div>

          {/* Mobile Menu Button - Premium */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2.5 rounded-xl hover:bg-gray-100 transition-colors border border-gray-200"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-700" />
            ) : (
              <Menu className="w-6 h-6 text-gray-700" />
            )}
          </button>
        </div>

        {/* Mobile Menu - Premium Design */}
        {isMobileMenuOpen && (
          <div className="lg:hidden py-6 border-t border-gray-200 animate-slide-up">
            <div className="flex flex-col space-y-2">
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="mb-4">
                <div className="relative group">
                  <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search jobs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 text-sm bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium text-gray-900 placeholder-gray-500"
                  />
                </div>
              </form>

              <Link
                href="/jobs"
                className="flex items-center gap-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 font-bold py-3.5 px-4 rounded-xl transition-all"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Briefcase className="w-5 h-5" />
                <span>Jobs</span>
              </Link>
              <Link
                href="/companies"
                className="flex items-center gap-3 text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 font-bold py-3.5 px-4 rounded-xl transition-all"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Building2 className="w-5 h-5" />
                <span>Companies</span>
              </Link>
              <Link
                href="/services"
                className="flex items-center gap-3 text-gray-700 hover:text-violet-600 hover:bg-violet-50 font-bold py-3.5 px-4 rounded-xl transition-all"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Sparkles className="w-5 h-5" />
                <span>Services</span>
              </Link>

              <div className="pt-4 mt-4 border-t border-gray-200 flex flex-col space-y-3">
                <Link
                  href="/signin"
                  className="text-center text-gray-700 hover:text-gray-900 font-bold py-3.5 px-4 rounded-xl hover:bg-gray-100 transition-all border border-gray-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="text-center bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white px-6 py-3.5 rounded-xl hover:shadow-xl font-bold transition-all"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
