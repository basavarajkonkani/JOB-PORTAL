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
      setIsScrolled(window.scrollY > 10);
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
    <header className={`sticky top-0 z-50 backdrop-blur-xl border-b transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/90 border-blue-100/60 shadow-md' 
        : 'bg-white/80 border-blue-100/50 shadow-soft'
    }`}>
      <nav className="max-w-container mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand - Perfect Alignment */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 group">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:shadow-lg group-hover:shadow-blue-500/30 transition-all duration-300">
              <Briefcase className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent hidden sm:block">
              AI Job Portal
            </span>
          </Link>

          {/* Desktop Navigation Links - Equal Spacing */}
          <div className="hidden lg:flex items-center gap-8 ml-10">
            <Link
              href="/jobs"
              className="text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors duration-200 relative py-2 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-gradient-to-r after:from-blue-600 after:to-indigo-600 hover:after:w-full after:transition-all after:duration-300"
            >
              Jobs
            </Link>
            <Link
              href="/companies"
              className="text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors duration-200 relative py-2 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-gradient-to-r after:from-blue-600 after:to-indigo-600 hover:after:w-full after:transition-all after:duration-300"
            >
              Companies
            </Link>
            <Link
              href="/services"
              className="text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors duration-200 relative py-2 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-gradient-to-r after:from-blue-600 after:to-indigo-600 hover:after:w-full after:transition-all after:duration-300"
            >
              Services
            </Link>
          </div>

          {/* Search Bar - Desktop - Perfect Centering */}
          <form onSubmit={handleSearch} className="hidden lg:flex items-center flex-1 max-w-md mx-10">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search jobs, companies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-11 pr-4 text-sm text-gray-900 placeholder-gray-500 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-200"
              />
            </div>
          </form>

          {/* Auth Buttons - Desktop - Equal Height & Perfect Alignment */}
          <div className="hidden lg:flex items-center gap-3 flex-shrink-0">
            <Link
              href="/signin"
              className="h-10 px-6 flex items-center justify-center text-sm font-semibold text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all duration-200"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="h-10 px-6 flex items-center justify-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-700" />
            ) : (
              <Menu className="w-6 h-6 text-gray-700" />
            )}
          </button>
        </div>

        {/* Mobile Menu - Smooth Slide Down */}
        {isMobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gray-100 animate-slide-up">
            <div className="flex flex-col space-y-1">
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="mb-4">
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search jobs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </form>

              <Link
                href="/jobs"
                className="flex items-center gap-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 font-semibold py-3 px-4 rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Briefcase className="w-5 h-5" />
                <span>Jobs</span>
              </Link>
              <Link
                href="/companies"
                className="flex items-center gap-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 font-semibold py-3 px-4 rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Building2 className="w-5 h-5" />
                <span>Companies</span>
              </Link>
              <Link
                href="/services"
                className="flex items-center gap-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 font-semibold py-3 px-4 rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Sparkles className="w-5 h-5" />
                <span>Services</span>
              </Link>

              <div className="pt-4 mt-4 border-t border-gray-100 flex flex-col space-y-3">
                <Link
                  href="/signin"
                  className="text-center text-gray-700 hover:text-gray-900 font-semibold py-3 px-4 rounded-lg hover:bg-gray-100 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="text-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 font-semibold shadow-lg shadow-blue-500/25"
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
