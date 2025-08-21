export function initGoogleAnalytics(gaId) {
  if (!gaId || typeof window === 'undefined') return;
  
  // Check if gtag is already loaded
  if (window.gtag) return;
  
  // Load Google Analytics
  const script1 = document.createElement('script');
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
  script1.async = true;
  document.head.appendChild(script1);
  
  // Initialize gtag
  window.dataLayer = window.dataLayer || [];
  function gtag(){window.dataLayer.push(arguments);}
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', gaId);
}

export function trackPageView(path, title) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', window.GA_MEASUREMENT_ID, {
      page_path: path,
      page_title: title,
    });
  }
}

export function trackEvent(action, category = 'engagement', label, value) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
}