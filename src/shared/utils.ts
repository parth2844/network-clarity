import { isTrackerDomain } from './tracker-list';

/**
 * Extract the domain from a URL
 */
export function getDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return '';
  }
}

/**
 * Extract the base domain (registrable domain) from a hostname
 * e.g., "www.sub.example.com" -> "example.com"
 * This is a simplified implementation - for production, consider using a public suffix list
 */
export function getBaseDomain(hostname: string): string {
  const parts = hostname.toLowerCase().replace(/^www\./, '').split('.');
  
  // Handle common TLDs with two parts (e.g., .co.uk, .com.au)
  const twoPartTLDs = ['co.uk', 'com.au', 'co.nz', 'co.jp', 'com.br', 'co.in'];
  
  if (parts.length >= 3) {
    const lastTwo = parts.slice(-2).join('.');
    if (twoPartTLDs.includes(lastTwo)) {
      return parts.slice(-3).join('.');
    }
  }
  
  // Default: return last two parts
  if (parts.length >= 2) {
    return parts.slice(-2).join('.');
  }
  
  return hostname;
}

/**
 * Check if a request URL is third-party relative to the page URL
 */
export function isThirdParty(requestUrl: string, pageUrl: string): boolean {
  const requestDomain = getDomain(requestUrl);
  const pageDomain = getDomain(pageUrl);
  
  if (!requestDomain || !pageDomain) {
    return false;
  }
  
  return getBaseDomain(requestDomain) !== getBaseDomain(pageDomain);
}

/**
 * Classify a request based on its URL and the page URL
 */
export function classifyRequest(
  requestUrl: string,
  pageUrl: string
): { isThirdParty: boolean; isTracker: boolean; domain: string } {
  const domain = getDomain(requestUrl);
  const thirdParty = isThirdParty(requestUrl, pageUrl);
  const tracker = isTrackerDomain(domain);
  
  return {
    isThirdParty: thirdParty,
    isTracker: tracker,
    domain,
  };
}

/**
 * Generate a unique ID for a request
 */
export function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Format bytes to human-readable string
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Format duration in milliseconds to human-readable string
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) {
    return `${Math.round(ms)} ms`;
  }
  return `${(ms / 1000).toFixed(2)} s`;
}

/**
 * Truncate a URL for display, keeping the most relevant parts
 */
export function truncateUrl(url: string, maxLength: number = 60): string {
  if (url.length <= maxLength) {
    return url;
  }
  
  try {
    const urlObj = new URL(url);
    const path = urlObj.pathname + urlObj.search;
    
    if (path.length > maxLength - 20) {
      // Truncate path, keeping beginning and end
      const halfLength = Math.floor((maxLength - 23) / 2);
      return `${urlObj.hostname}${path.substring(0, halfLength)}...${path.substring(path.length - halfLength)}`;
    }
    
    return `${urlObj.hostname}${path}`;
  } catch {
    // Fallback: simple truncation
    return `${url.substring(0, maxLength - 3)}...`;
  }
}

/**
 * Get a human-readable request type name
 */
export function getRequestTypeName(type: string): string {
  const typeNames: Record<string, string> = {
    main_frame: 'Document',
    sub_frame: 'Frame',
    stylesheet: 'Stylesheet',
    script: 'Script',
    image: 'Image',
    font: 'Font',
    object: 'Object',
    xmlhttprequest: 'API Call',
    ping: 'Ping',
    csp_report: 'CSP Report',
    media: 'Media',
    websocket: 'WebSocket',
    other: 'Other',
  };
  
  return typeNames[type] || type;
}
