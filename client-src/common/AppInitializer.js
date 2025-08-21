import {initGoogleAnalytics} from './AnalyticsUtils';
import {initWebVitals, optimizeImageLoading} from './WebVitalsUtils';

export function initializeApp() {
  // Initialize Google Analytics if GA ID is available in the HTML
  const gaScripts = document.querySelectorAll('script[src*="googletagmanager.com/gtag/js"]');
  if (gaScripts.length > 0) {
    const gaScript = gaScripts[0];
    const gaId = gaScript.src.match(/id=([^&]+)/)?.[1] || 'G-ZK833WGLV3';
    if (gaId && !window.gtag) {
      // Initialize gtag function only - script is already loaded from server
      window.dataLayer = window.dataLayer || [];
      function gtag(){window.dataLayer.push(arguments);}
      window.gtag = gtag;
      gtag('js', new Date());
      gtag('config', gaId);
      
      // Store GA ID globally for page tracking
      window.GA_MEASUREMENT_ID = gaId;
    }
  } else {
    // Fallback: if no GA script found, use default ID
    const defaultGaId = 'G-ZK833WGLV3';
    if (!window.gtag) {
      // Load GA script dynamically
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${defaultGaId}`;
      document.head.appendChild(script);
      
      // Initialize gtag
      window.dataLayer = window.dataLayer || [];
      function gtag(){window.dataLayer.push(arguments);}
      window.gtag = gtag;
      gtag('js', new Date());
      gtag('config', defaultGaId);
      
      window.GA_MEASUREMENT_ID = defaultGaId;
    }
  }
  
  // Track initial page view
  if (window.gtag && window.GA_MEASUREMENT_ID) {
    window.gtag('config', window.GA_MEASUREMENT_ID, {
      page_path: window.location.pathname,
      page_title: document.title,
    });
  }
  
  // Initialize Web Vitals monitoring
  initWebVitals();
  
  // Optimize image loading
  optimizeImageLoading();
  
  // Add performance observer for other metrics
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            // Track page load time
            if (window.gtag) {
              window.gtag('event', 'page_load_time', {
                event_category: 'Performance',
                value: Math.round(entry.loadEventEnd - entry.fetchStart),
                non_interaction: true,
              });
            }
          }
        }
      });
      observer.observe({entryTypes: ['navigation']});
    } catch (e) {
      // Ignore PerformanceObserver errors
    }
  }
}