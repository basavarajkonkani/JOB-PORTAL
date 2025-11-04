'use client';

import { useState, FormEvent } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useAnalytics, EventType } from '@/lib/useAnalytics';
import SignInHero from './SignInHero';
import { GoogleIcon, SpinnerIcon, ErrorIcon } from './SignInIcons';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { signIn, signInWithGoogle } = useAuth();
  const router = useRouter();
  const { trackEvent } = useAnalytics();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await signIn(email, password);

      // Track user signin
      trackEvent({
        eventType: EventType.USER_SIGNED_IN,
        properties: {},
      });

      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setIsGoogleLoading(true);

    try {
      await signInWithGoogle('candidate');

      // Track user signin
      trackEvent({
        eventType: EventType.USER_SIGNED_IN,
        properties: { method: 'google' },
      });

      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google sign in failed');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-2 min-h-screen">
      {/* Hero Section - Left Column (Hidden on mobile < 1024px) */}
      <SignInHero className="hidden lg:block" />

      {/* Form Panel - Right Column */}
      <div className="flex items-center justify-center bg-white px-4 py-8 md:py-12 lg:px-8">
        <div className="w-full max-w-[480px]">
          <h1 className="sr-only">Sign In to Your Account</h1>
          
          {/* Google Sign-In Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading || isLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 min-h-[44px] border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:border-blue-500 transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed mb-6 touch-manipulation transform hover:scale-[1.02] active:scale-[0.98]"
            aria-label="Sign up with Google"
            aria-disabled={isGoogleLoading || isLoading}
            tabIndex={0}
          >
            {isGoogleLoading ? (
              <SpinnerIcon className="h-5 w-5 text-gray-600" aria-hidden />
            ) : (
              <GoogleIcon aria-hidden />
            )}
            <span className="text-gray-700 font-medium">
              {isGoogleLoading ? 'Signing in...' : 'Sign up with Google'}
            </span>
          </button>

          {/* OR Divider */}
          <div className="relative mb-6" aria-hidden="true">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500 font-medium">OR</span>
            </div>
          </div>

          {/* Error Message - ARIA live region for screen reader announcements */}
          <div role="alert" aria-live="assertive" aria-atomic="true">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg animate-slide-in-down">
                <div className="flex items-center">
                  <ErrorIcon className="mr-2 flex-shrink-0 animate-shake" aria-hidden />
                  <p className="text-sm text-red-700 font-medium" id="error-message">{error}</p>
                </div>
              </div>
            )}
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4" aria-label="Sign in form">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Official Email Id <span className="text-red-600" aria-label="required">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                aria-required="true"
                aria-invalid={error ? 'true' : 'false'}
                aria-describedby={error ? 'error-message' : undefined}
                autoComplete="email"
                inputMode="email"
                disabled={isLoading || isGoogleLoading}
                tabIndex={0}
                className="w-full px-4 py-3 min-h-[44px] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:border-blue-500 hover:border-blue-400 hover:shadow-sm transition-all duration-300 ease-in-out touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password <span className="text-red-600" aria-label="required">*</span>
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                aria-required="true"
                aria-invalid={error ? 'true' : 'false'}
                aria-describedby={error ? 'error-message' : undefined}
                autoComplete="current-password"
                disabled={isLoading || isGoogleLoading}
                tabIndex={0}
                className="w-full px-4 py-3 min-h-[44px] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:border-blue-500 hover:border-blue-400 hover:shadow-sm transition-all duration-300 ease-in-out touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="••••••••"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  aria-label="First Name"
                  autoComplete="given-name"
                  disabled={isLoading || isGoogleLoading}
                  tabIndex={0}
                  className="w-full px-4 py-3 min-h-[44px] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:border-blue-500 hover:border-blue-400 hover:shadow-sm transition-all duration-300 ease-in-out touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="John"
                />
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  aria-label="Last Name"
                  autoComplete="family-name"
                  disabled={isLoading || isGoogleLoading}
                  tabIndex={0}
                  className="w-full px-4 py-3 min-h-[44px] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:border-blue-500 hover:border-blue-400 hover:shadow-sm transition-all duration-300 ease-in-out touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Doe"
                />
              </div>
            </div>

            <div>
              <label htmlFor="mobileNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Mobile Number
              </label>
              <div className="flex gap-2">
                <select
                  id="countryCode"
                  name="countryCode"
                  className="px-3 py-3 min-h-[44px] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:border-blue-500 hover:border-blue-400 hover:shadow-sm bg-white touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 ease-in-out"
                  aria-label="Country Code"
                  disabled={isLoading || isGoogleLoading}
                  tabIndex={0}
                >
                  <option value="+91">+91</option>
                </select>
                <input
                  id="mobileNumber"
                  name="mobileNumber"
                  type="tel"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  aria-label="Mobile Number"
                  autoComplete="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  disabled={isLoading || isGoogleLoading}
                  tabIndex={0}
                  className="flex-1 px-4 py-3 min-h-[44px] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:border-blue-500 hover:border-blue-400 hover:shadow-sm transition-all duration-300 ease-in-out touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="9876543210"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || isGoogleLoading}
              className="w-full bg-[#C2410C] text-white py-3.5 px-4 min-h-[44px] rounded-lg hover:bg-[#9A3412] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#C2410C] focus:ring-offset-2 focus:border-[#C2410C] disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all duration-300 ease-in-out touch-manipulation transform hover:scale-[1.02] active:scale-[0.98]"
              aria-label="Submit sign in form"
              aria-disabled={isLoading || isGoogleLoading}
              tabIndex={0}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <SpinnerIcon className="-ml-1 mr-3 h-5 w-5 text-white" aria-hidden />
                  <span>Signing in...</span>
                </span>
              ) : (
                'Post for Free'
              )}
            </button>
          </form>

          {/* Login Link */}
          <p className="mt-6 text-center text-sm text-gray-600">
            Already registered?{' '}
            <a 
              href="/signin" 
              className="text-blue-600 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:border-blue-500 rounded px-1 font-semibold hover:underline inline-block transition-all duration-300 ease-in-out transform hover:scale-105"
              aria-label="Go to login page"
              tabIndex={0}
            >
              Login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
