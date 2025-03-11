import { HistoryItem } from '@/types';
import { v4 as uuidv4 } from 'uuid';

// Base URL of the proxy service - direct public proxy
const EXTERNAL_PROXY_URL = 'https://foreverkyx.lavipet.info/';
// Local API proxy endpoint
const LOCAL_API_PROXY = '/api/proxy';

/**
 * Navigate to a URL through the proxy
 * @param query URL or search query to proxy
 * @param saveToHistory Function to save to history
 * @returns void
 */
export const navigateToProxy = (query: string, saveToHistory?: (item: HistoryItem) => void): void => {
  // Prepare the URL to navigate to
  let url = query;
  
  // Check if it's a valid URL
  if (!isValidUrl(query)) {
    // If not a URL, treat as a search query
    url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
  }
  
  // If we need to save to history
  if (saveToHistory) {
    const historyItem: HistoryItem = {
      id: uuidv4(),
      title: getPageTitle(url),
      url,
      icon: getIconType(url),
      timestamp: new Date(),
    };
    
    saveToHistory(historyItem);
  }
  
  // Use direct proxy URL (more reliable than our simple API proxy for now)
  const proxyUrl = `${EXTERNAL_PROXY_URL}${encodeURIComponent(url)}`;
  
  // For local debugging, we could use this instead:
  // fetch(`${LOCAL_API_PROXY}?url=${encodeURIComponent(url)}`)
  //   .then(response => response.json())
  //   .then(data => {
  //     if (data.proxyUrl) {
  //       window.location.href = data.proxyUrl;
  //     }
  //   })
  //   .catch(error => {
  //     console.error('Proxy fetch error:', error);
  //     // Fallback to direct proxy on error
  //     window.location.href = proxyUrl;
  //   });
  
  // Navigate directly to external proxy URL
  window.location.href = proxyUrl;
};

/**
 * Check if string is a valid URL
 * @param string to check
 * @returns boolean
 */
const isValidUrl = (str: string): boolean => {
  try {
    const url = new URL(str);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

/**
 * Get a title for the page based on the URL
 * @param url URL to generate title from
 * @returns string
 */
const getPageTitle = (url: string): string => {
  try {
    const { hostname } = new URL(url);
    
    // Handle common sites
    if (hostname.includes('google.com')) {
      return 'Google Search';
    } else if (hostname.includes('youtube.com')) {
      return 'YouTube Video';
    } else if (hostname.includes('wikipedia.org')) {
      return 'Wikipedia Article';
    } else if (hostname.includes('github.com')) {
      return 'GitHub Repository';
    }
    
    // Extract domain name for title
    const domainParts = hostname.split('.');
    const domain = domainParts.length > 1 
      ? domainParts[domainParts.length - 2].charAt(0).toUpperCase() + domainParts[domainParts.length - 2].slice(1)
      : hostname;
    
    return domain;
  } catch {
    return 'Web Page';
  }
};

/**
 * Get icon type based on URL
 * @param url URL to check
 * @returns string icon name
 */
const getIconType = (url: string): string => {
  try {
    const { hostname } = new URL(url);
    
    if (hostname.includes('google.com')) return 'google';
    if (hostname.includes('youtube.com')) return 'youtube';
    if (hostname.includes('wikipedia.org')) return 'book';
    if (hostname.includes('github.com')) return 'github';
    if (hostname.includes('twitter.com') || hostname.includes('x.com')) return 'twitter';
    if (hostname.includes('facebook.com')) return 'facebook';
    if (hostname.includes('instagram.com')) return 'instagram';
    if (hostname.includes('reddit.com')) return 'reddit';
    if (hostname.includes('amazon.com')) return 'shopping-cart';
    if (hostname.includes('netflix.com')) return 'film';
    
    return 'globe';
  } catch {
    return 'globe';
  }
};
