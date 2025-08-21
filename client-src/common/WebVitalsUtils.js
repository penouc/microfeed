import {trackEvent} from './AnalyticsUtils';

// Web Vitals monitoring using native Performance API
export function initWebVitals() {
  if (typeof window === 'undefined') return;
  
  // Only track if Analytics is available
  if (!window.gtag) return;
  
  // Use Performance Observer for Web Vitals tracking
  if ('PerformanceObserver' in window) {
    try {
      // Track Largest Contentful Paint (LCP)
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        sendToGoogleAnalytics({
          name: 'LCP',
          delta: lastEntry.renderTime || lastEntry.loadTime,
          id: 'lcp'
        });
      });
      lcpObserver.observe({entryTypes: ['largest-contentful-paint']});
      
      // Track First Input Delay (FID)
      const fidObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          sendToGoogleAnalytics({
            name: 'FID',
            delta: entry.processingStart - entry.startTime,
            id: 'fid'
          });
        }
      });
      fidObserver.observe({entryTypes: ['first-input']});
      
      // Track Cumulative Layout Shift (CLS)
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        }
        sendToGoogleAnalytics({
          name: 'CLS',
          delta: clsValue,
          id: 'cls'
        });
      });
      clsObserver.observe({entryTypes: ['layout-shift']});
      
    } catch (e) {
      // Ignore PerformanceObserver errors
      console.log('Web Vitals monitoring not supported');
    }
  }
}

function sendToGoogleAnalytics({name, delta, id}) {
  // Track Web Vitals with Google Analytics
  trackEvent('web_vitals', 'performance', name, Math.round(name === 'CLS' ? delta * 1000 : delta));
  
  // Also send as custom event
  if (window.gtag) {
    window.gtag('event', name, {
      event_category: 'Web Vitals',
      event_label: id,
      value: Math.round(name === 'CLS' ? delta * 1000 : delta),
      non_interaction: true,
    });
  }
}

// Image loading optimization
export function optimizeImageLoading() {
  if (typeof window === 'undefined') return;
  
  // Add loading="lazy" to images that don't have it
  const images = document.querySelectorAll('img:not([loading])');
  images.forEach(img => {
    if (img.getBoundingClientRect().top > window.innerHeight) {
      img.loading = 'lazy';
    }
  });
  
  // Preload critical images
  const criticalImages = document.querySelectorAll('img[data-critical="true"]');
  criticalImages.forEach(img => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = img.src;
    document.head.appendChild(link);
  });
}

// Resource hints for better performance
export function addResourceHints() {
  if (typeof document === 'undefined') return;
  
  const resourceHints = [
    {rel: 'dns-prefetch', href: '//fonts.googleapis.com'},
    {rel: 'dns-prefetch', href: '//www.googletagmanager.com'},
    {rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous'},
  ];
  
  resourceHints.forEach(hint => {
    const link = document.createElement('link');
    link.rel = hint.rel;
    link.href = hint.href;
    if (hint.crossOrigin) link.crossOrigin = hint.crossOrigin;
    document.head.appendChild(link);
  });
}