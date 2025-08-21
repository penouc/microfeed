import {trackEvent} from './AnalyticsUtils';

// Web Vitals monitoring
export function initWebVitals() {
  if (typeof window === 'undefined') return;
  
  // Only load Web Vitals library if Analytics is available
  if (!window.gtag) return;
  
  // Dynamically import web-vitals library
  import('web-vitals').then(({getCLS, getFID, getFCP, getLCP, getTTFB}) => {
    // Track Core Web Vitals
    getCLS(sendToGoogleAnalytics);
    getFID(sendToGoogleAnalytics);
    getFCP(sendToGoogleAnalytics);
    getLCP(sendToGoogleAnalytics);
    getTTFB(sendToGoogleAnalytics);
  }).catch(() => {
    // Fallback if web-vitals library is not available
    console.log('Web Vitals library not available');
  });
}

function sendToGoogleAnalytics({name, delta, value, id}) {
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