import {SETTINGS_CATEGORIES} from "../../common-src/Constants";

export function getSeoConfig(feed) {
  // Handle case where feed might not be available or have different structure
  if (!feed) {
    return {
      googleAnalyticsId: 'G-ZK833WGLV3',
      seoSettings: {
        twitterHandle: '',
        ogDefaultImage: '',
      }
    };
  }
  
  // Check both feed.settings and feed directly for settings
  const settings = feed.settings || feed;
  const webGlobalSettings = settings[SETTINGS_CATEGORIES.WEB_GLOBAL_SETTINGS] || {};
  
  return {
    googleAnalyticsId: webGlobalSettings.googleAnalyticsId || 'G-ZK833WGLV3',
    seoSettings: webGlobalSettings.seoSettings || {
      twitterHandle: '',
      ogDefaultImage: '',
    }
  };
}

export function buildOpenGraphTags(item, jsonData, seoConfig, canonicalUrl) {
  const siteName = jsonData.title;
  const title = item?.title || jsonData.title;
  const description = item?.content_text || jsonData._microfeed?.description_text || jsonData.description;
  const image = item?.image || seoConfig.seoSettings?.ogDefaultImage || null;
  const url = canonicalUrl || jsonData.home_page_url;
  
  return {
    title,
    description,
    type: item ? 'article' : 'website',
    url,
    image,
    siteName,
  };
}

export function buildTwitterCardTags(item, jsonData, seoConfig, canonicalUrl) {
  const title = item?.title || jsonData.title;
  const description = item?.content_text || jsonData._microfeed?.description_text || jsonData.description;
  const image = item?.image || seoConfig.seoSettings?.ogDefaultImage || null;
  const site = seoConfig.seoSettings?.twitterHandle || null;
  
  return {
    card: image ? 'summary_large_image' : 'summary',
    site,
    creator: site,
    title,
    description,
    image,
  };
}

export function generateStructuredData(item, jsonData, canonicalUrl) {
  if (item) {
    return {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": item.title,
      "description": item.content_text,
      "image": item.image,
      "datePublished": item.date_published,
      "dateModified": item.date_modified || item.date_published,
      "author": {
        "@type": "Organization",
        "name": jsonData.title,
        "url": jsonData.home_page_url
      },
      "publisher": {
        "@type": "Organization",
        "name": jsonData.title,
        "url": jsonData.home_page_url
      },
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": canonicalUrl
      }
    };
  }
  
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": jsonData.title,
    "description": jsonData.description,
    "url": jsonData.home_page_url,
    "publisher": {
      "@type": "Organization",
      "name": jsonData.title,
      "url": jsonData.home_page_url
    }
  };
}