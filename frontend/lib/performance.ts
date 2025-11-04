/**
 * Performance monitoring utilities
 * Tracks Core Web Vitals and custom performance metrics
 */

export interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
}

/**
 * Report Web Vitals to analytics
 */
export function reportWebVitals(metric: PerformanceMetric) {
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Performance] ${metric.name}:`, {
      value: metric.value,
      rating: metric.rating,
    });
  }

  // Send to analytics in production
  if (process.env.NODE_ENV === 'production') {
    // Analytics integration can be added here
  }
}

/**
 * Measure component render time
 */
export function measureRenderTime(componentName: string, startTime: number) {
  const endTime = performance.now();
  const duration = endTime - startTime;

  if (process.env.NODE_ENV === 'development') {
    console.log(`[Render Time] ${componentName}: ${duration.toFixed(2)}ms`);
  }

  return duration;
}

/**
 * Measure API call time
 */
export function measureApiCall(endpoint: string, startTime: number) {
  const endTime = performance.now();
  const duration = endTime - startTime;

  if (process.env.NODE_ENV === 'development') {
    console.log(`[API Call] ${endpoint}: ${duration.toFixed(2)}ms`);
  }

  return duration;
}

/**
 * Get performance rating based on value and thresholds
 */
export function getPerformanceRating(
  value: number,
  goodThreshold: number,
  poorThreshold: number
): 'good' | 'needs-improvement' | 'poor' {
  if (value <= goodThreshold) return 'good';
  if (value <= poorThreshold) return 'needs-improvement';
  return 'poor';
}

/**
 * Monitor Largest Contentful Paint (LCP)
 * Good: < 2.5s, Needs Improvement: < 4s, Poor: >= 4s
 */
export function observeLCP(callback: (metric: PerformanceMetric) => void) {
  if (typeof window === 'undefined') return;

  const observer = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const lastEntry = entries[entries.length - 1] as any;

    const metric: PerformanceMetric = {
      name: 'LCP',
      value: lastEntry.renderTime || lastEntry.loadTime,
      rating: getPerformanceRating(lastEntry.renderTime || lastEntry.loadTime, 2500, 4000),
      timestamp: Date.now(),
    };

    callback(metric);
  });

  try {
    observer.observe({ type: 'largest-contentful-paint', buffered: true });
  } catch (e) {
    // LCP not supported
  }
}

/**
 * Monitor First Input Delay (FID)
 * Good: < 100ms, Needs Improvement: < 300ms, Poor: >= 300ms
 */
export function observeFID(callback: (metric: PerformanceMetric) => void) {
  if (typeof window === 'undefined') return;

  const observer = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    entries.forEach((entry: any) => {
      const metric: PerformanceMetric = {
        name: 'FID',
        value: entry.processingStart - entry.startTime,
        rating: getPerformanceRating(entry.processingStart - entry.startTime, 100, 300),
        timestamp: Date.now(),
      };

      callback(metric);
    });
  });

  try {
    observer.observe({ type: 'first-input', buffered: true });
  } catch (e) {
    // FID not supported
  }
}

/**
 * Monitor Cumulative Layout Shift (CLS)
 * Good: < 0.1, Needs Improvement: < 0.25, Poor: >= 0.25
 */
export function observeCLS(callback: (metric: PerformanceMetric) => void) {
  if (typeof window === 'undefined') return;

  let clsValue = 0;
  const observer = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    entries.forEach((entry: any) => {
      if (!entry.hadRecentInput) {
        clsValue += entry.value;
      }
    });

    const metric: PerformanceMetric = {
      name: 'CLS',
      value: clsValue,
      rating: getPerformanceRating(clsValue, 0.1, 0.25),
      timestamp: Date.now(),
    };

    callback(metric);
  });

  try {
    observer.observe({ type: 'layout-shift', buffered: true });
  } catch (e) {
    // CLS not supported
  }
}

/**
 * Initialize all performance observers
 */
export function initPerformanceMonitoring() {
  if (typeof window === 'undefined') return;

  observeLCP(reportWebVitals);
  observeFID(reportWebVitals);
  observeCLS(reportWebVitals);
}
