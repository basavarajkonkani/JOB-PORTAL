'use client';

import Image from 'next/image';
import { CheckIcon, StarIcon, HalfStarIcon } from './SignInIcons';

interface SignInHeroProps {
  className?: string;
}

export default function SignInHero({ className = '' }: SignInHeroProps) {
  return (
    <div
      className={`hidden lg:flex flex-col justify-center items-start bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 text-white p-8 md:p-12 min-h-screen ${className}`}
      role="complementary"
      aria-label="Platform information and statistics"
    >
      <div className="max-w-xl space-y-8 animate-fade-in">
        {/* Platform Badge */}
        <div className="inline-block animate-slide-in-left animation-delay-100">
          <div className="bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium border border-white/20 transition-all duration-300 hover:bg-white/20 hover:scale-105" role="status">
            India&apos;s #1 AI-Powered early talent hiring platform
          </div>
        </div>

        {/* Main Heading */}
        <h2 className="text-5xl font-bold leading-tight animate-slide-in-left animation-delay-200">
          Hire Interns and Freshers{' '}
          <span className="text-yellow-400 transition-all duration-300 hover:text-yellow-300">Faster</span>
        </h2>

        {/* Bullet Points */}
        <ul className="space-y-4 animate-slide-in-left animation-delay-300" role="list" aria-label="Platform benefits">
          <li className="flex items-start gap-3 transition-transform duration-300 hover:translate-x-2">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center mt-1 transition-all duration-300 hover:scale-110 hover:bg-green-400" aria-hidden="true">
              <CheckIcon />
            </div>
            <p className="text-lg">
              Reduce hiring time by 50% with AI-Powered Tools
            </p>
          </li>
          <li className="flex items-start gap-3 transition-transform duration-300 hover:translate-x-2">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center mt-1 transition-all duration-300 hover:scale-110 hover:bg-green-400" aria-hidden="true">
              <CheckIcon />
            </div>
            <p className="text-lg">
              Get applicants from top colleges across India
            </p>
          </li>
        </ul>

        {/* Statistics Cards */}
        <div className="grid grid-cols-3 gap-4 pt-4 animate-slide-in-left animation-delay-400" role="region" aria-label="Platform statistics">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 transition-all duration-300 hover:bg-white/20 hover:scale-105 hover:shadow-lg">
            <div className="text-3xl font-bold" aria-label="32 million plus candidates">32 Mn+</div>
            <div className="text-sm text-white/80 mt-1">Candidates</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 transition-all duration-300 hover:bg-white/20 hover:scale-105 hover:shadow-lg">
            <div className="text-3xl font-bold" aria-label="100 thousand plus companies">100 K+</div>
            <div className="text-sm text-white/80 mt-1">Companies</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 transition-all duration-300 hover:bg-white/20 hover:scale-105 hover:shadow-lg">
            <div className="text-3xl font-bold" aria-label="900 plus cities">900+</div>
            <div className="text-sm text-white/80 mt-1">Cities</div>
          </div>
        </div>

        {/* Rating Indicator */}
        <div className="flex items-center gap-3 pt-4 animate-slide-in-left animation-delay-500" role="region" aria-label="User ratings">
          <div className="flex gap-1" role="img" aria-label="4.5 out of 5 stars">
            {[1, 2, 3, 4].map((star) => (
              <StarIcon
                key={star}
                className="w-5 h-5 text-yellow-400 fill-current transition-transform duration-300 hover:scale-125"
                aria-hidden
              />
            ))}
            <HalfStarIcon
              className="w-5 h-5 text-yellow-400 transition-transform duration-300 hover:scale-125"
              aria-hidden
            />
          </div>
          <div className="text-sm">
            <span className="font-semibold">4.5</span>
            <span className="text-white/80 ml-2">
              Rated by 2,448 users as on 6th October 2025
            </span>
          </div>
        </div>

        {/* Hero Image */}
        <div className="pt-8 animate-slide-in-left animation-delay-600">
          <div className="relative w-full h-64 rounded-lg overflow-hidden shadow-2xl transition-all duration-500 hover:shadow-3xl hover:scale-105" role="img" aria-label="Professional working on laptop">
            <Image
              src="/hero-professional.webp"
              alt="Professional using laptop for hiring"
              fill
              sizes="(max-width: 768px) 0vw, (max-width: 1024px) 0vw, 50vw"
              className="object-cover transition-transform duration-500 hover:scale-110"
              priority={false}
              loading="lazy"
              quality={85}
              placeholder="blur"
              blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNzAwIiBoZWlnaHQ9IjQ3NSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNzAwIiBoZWlnaHQ9IjQ3NSIgZmlsbD0icmdiYSgyNTUsIDI1NSwgMjU1LCAwLjEpIi8+PC9zdmc+"
              onError={(e) => {
                // Fallback to JPEG if WebP doesn't exist, then to placeholder
                const target = e.target as HTMLImageElement;
                if (target.src.includes('.webp')) {
                  target.src = '/hero-professional.jpg';
                } else {
                  target.style.display = 'none';
                  if (target.parentElement) {
                    target.parentElement.style.background =
                      'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)';
                  }
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
