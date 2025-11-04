'use client';

import { useEffect } from 'react';
import { initPerformanceMonitoring } from '@/lib/performance';

/**
 * Performance monitoring component
 * Initializes Web Vitals tracking on mount
 */
export default function PerformanceMonitor() {
  useEffect(() => {
    // Initialize performance monitoring
    initPerformanceMonitoring();
  }, []);

  // This component doesn't render anything
  return null;
}
