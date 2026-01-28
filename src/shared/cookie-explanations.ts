/**
 * Cookie Explanations for Network Clarity
 * Explains common cookies and their purposes in plain English
 */

export interface CookieExplanation {
  name: string;
  category: 'essential' | 'functional' | 'analytics' | 'advertising' | 'tracking' | 'unknown';
  description: string;
  risk: 'low' | 'medium' | 'high';
}

// Common cookie patterns and their explanations
export const KNOWN_COOKIES: Record<string, CookieExplanation> = {
  // Session & Authentication
  'sessionid': {
    name: 'Session ID',
    category: 'essential',
    description: 'Keeps you logged in as you browse. Essential for the website to work.',
    risk: 'low',
  },
  'session': {
    name: 'Session',
    category: 'essential',
    description: 'Maintains your session while browsing. Needed for the site to function.',
    risk: 'low',
  },
  'auth': {
    name: 'Authentication',
    category: 'essential',
    description: 'Proves you\'re logged in. Essential for accessing your account.',
    risk: 'low',
  },
  'token': {
    name: 'Auth Token',
    category: 'essential',
    description: 'Security token for authentication. Keeps your session secure.',
    risk: 'low',
  },
  'csrf': {
    name: 'CSRF Protection',
    category: 'essential',
    description: 'Security feature to prevent malicious form submissions.',
    risk: 'low',
  },
  'xsrf': {
    name: 'XSRF Token',
    category: 'essential',
    description: 'Security token to prevent cross-site request forgery attacks.',
    risk: 'low',
  },
  
  // Preferences
  'locale': {
    name: 'Language',
    category: 'functional',
    description: 'Remembers your language preference.',
    risk: 'low',
  },
  'lang': {
    name: 'Language',
    category: 'functional',
    description: 'Stores your language setting.',
    risk: 'low',
  },
  'theme': {
    name: 'Theme',
    category: 'functional',
    description: 'Remembers light/dark mode preference.',
    risk: 'low',
  },
  'timezone': {
    name: 'Timezone',
    category: 'functional',
    description: 'Stores your timezone for displaying times correctly.',
    risk: 'low',
  },
  'consent': {
    name: 'Cookie Consent',
    category: 'functional',
    description: 'Remembers your cookie consent choice.',
    risk: 'low',
  },
  
  // Google Analytics
  '_ga': {
    name: 'Google Analytics',
    category: 'analytics',
    description: 'Tracks your visits across pages. Used to analyze website traffic.',
    risk: 'medium',
  },
  '_gid': {
    name: 'Google Analytics (Daily)',
    category: 'analytics',
    description: 'Google Analytics cookie that tracks you for 24 hours.',
    risk: 'medium',
  },
  '_gat': {
    name: 'Google Analytics (Throttle)',
    category: 'analytics',
    description: 'Used to throttle request rate to Google Analytics.',
    risk: 'medium',
  },
  '__utma': {
    name: 'Google Analytics (Legacy)',
    category: 'analytics',
    description: 'Older Google Analytics cookie for tracking visitors.',
    risk: 'medium',
  },
  '__utmb': {
    name: 'Google Analytics (Session)',
    category: 'analytics',
    description: 'Tracks how long you spend on the site.',
    risk: 'medium',
  },
  '__utmc': {
    name: 'Google Analytics (Session)',
    category: 'analytics',
    description: 'Legacy session tracking cookie.',
    risk: 'medium',
  },
  '__utmz': {
    name: 'Google Analytics (Source)',
    category: 'analytics',
    description: 'Tracks how you arrived at the site (search, link, etc).',
    risk: 'medium',
  },
  
  // Facebook
  '_fbp': {
    name: 'Facebook Pixel',
    category: 'advertising',
    description: 'Facebook tracking to show you targeted ads on Facebook.',
    risk: 'high',
  },
  'fr': {
    name: 'Facebook Advertising',
    category: 'advertising',
    description: 'Facebook ad delivery and measurement.',
    risk: 'high',
  },
  '_fbc': {
    name: 'Facebook Click ID',
    category: 'advertising',
    description: 'Tracks when you click a Facebook ad.',
    risk: 'high',
  },
  
  // Google Ads
  'IDE': {
    name: 'Google DoubleClick',
    category: 'advertising',
    description: 'Used by Google to show personalized ads across websites.',
    risk: 'high',
  },
  '__gads': {
    name: 'Google Ads',
    category: 'advertising',
    description: 'Google advertising cookie for ad serving.',
    risk: 'high',
  },
  'DSID': {
    name: 'Google DoubleClick',
    category: 'advertising',
    description: 'Links your activity on other sites with Google ads.',
    risk: 'high',
  },
  '_gcl_au': {
    name: 'Google Conversion',
    category: 'advertising',
    description: 'Tracks conversions for Google Ads campaigns.',
    risk: 'high',
  },
  
  // Other Trackers
  '_tt_': {
    name: 'TikTok Pixel',
    category: 'tracking',
    description: 'TikTok tracking for ad targeting.',
    risk: 'high',
  },
  '_pinterest_': {
    name: 'Pinterest',
    category: 'tracking',
    description: 'Pinterest tracking for ads and analytics.',
    risk: 'high',
  },
  '_li_': {
    name: 'LinkedIn',
    category: 'tracking',
    description: 'LinkedIn tracking for ads and insights.',
    risk: 'high',
  },
  'hubspot': {
    name: 'HubSpot',
    category: 'analytics',
    description: 'Marketing analytics and tracking.',
    risk: 'medium',
  },
  'intercom': {
    name: 'Intercom',
    category: 'functional',
    description: 'Customer support chat widget.',
    risk: 'low',
  },
  'amplitude': {
    name: 'Amplitude',
    category: 'analytics',
    description: 'Product analytics tracking.',
    risk: 'medium',
  },
  'mixpanel': {
    name: 'Mixpanel',
    category: 'analytics',
    description: 'Product analytics and user tracking.',
    risk: 'medium',
  },
  'segment': {
    name: 'Segment',
    category: 'analytics',
    description: 'Data routing to multiple analytics services.',
    risk: 'medium',
  },
};

// Category labels
export const CATEGORY_INFO: Record<string, { label: string; color: string; description: string }> = {
  essential: {
    label: '🔒 Essential',
    color: 'text-green-600 bg-green-50',
    description: 'Required for the website to function. Cannot be blocked.',
  },
  functional: {
    label: '⚙️ Functional',
    color: 'text-blue-600 bg-blue-50',
    description: 'Remembers your preferences like language or theme.',
  },
  analytics: {
    label: '📊 Analytics',
    color: 'text-yellow-600 bg-yellow-50',
    description: 'Tracks how you use the website. Often shared with third parties.',
  },
  advertising: {
    label: '📢 Advertising',
    color: 'text-orange-600 bg-orange-50',
    description: 'Used to show you targeted ads across the internet.',
  },
  tracking: {
    label: '👁️ Tracking',
    color: 'text-red-600 bg-red-50',
    description: 'Tracks your activity across multiple websites.',
  },
  unknown: {
    label: '❓ Unknown',
    color: 'text-gray-600 bg-gray-50',
    description: 'Purpose not recognized.',
  },
};

// Get explanation for a cookie
export function getCookieExplanation(cookieName: string): CookieExplanation {
  const lowerName = cookieName.toLowerCase();
  
  // Direct match
  if (KNOWN_COOKIES[lowerName]) {
    return KNOWN_COOKIES[lowerName];
  }
  
  // Pattern matching
  for (const [pattern, explanation] of Object.entries(KNOWN_COOKIES)) {
    if (lowerName.includes(pattern.toLowerCase())) {
      return explanation;
    }
  }
  
  // Check for common patterns
  if (lowerName.includes('session') || lowerName.includes('sess')) {
    return {
      name: 'Session Cookie',
      category: 'essential',
      description: 'Maintains your browsing session.',
      risk: 'low',
    };
  }
  
  if (lowerName.includes('auth') || lowerName.includes('login') || lowerName.includes('user')) {
    return {
      name: 'Authentication',
      category: 'essential',
      description: 'Related to user authentication.',
      risk: 'low',
    };
  }
  
  if (lowerName.includes('analytics') || lowerName.includes('stat') || lowerName.includes('track')) {
    return {
      name: 'Analytics/Tracking',
      category: 'analytics',
      description: 'Used for analytics or user tracking.',
      risk: 'medium',
    };
  }
  
  if (lowerName.includes('ad') || lowerName.includes('campaign') || lowerName.includes('promo')) {
    return {
      name: 'Advertising',
      category: 'advertising',
      description: 'Likely used for advertising purposes.',
      risk: 'high',
    };
  }
  
  // Unknown cookie
  return {
    name: cookieName,
    category: 'unknown',
    description: 'Unknown purpose. May be functional or tracking.',
    risk: 'medium',
  };
}

// Parse cookie header string
export function parseCookieHeader(cookieHeader: string): { name: string; value: string }[] {
  if (!cookieHeader) return [];
  
  return cookieHeader.split(';').map(pair => {
    const [name, ...valueParts] = pair.trim().split('=');
    return {
      name: name.trim(),
      value: valueParts.join('=').trim(),
    };
  }).filter(c => c.name);
}

// Parse Set-Cookie header
export function parseSetCookieHeader(setCookieHeader: string): {
  name: string;
  value: string;
  attributes: Record<string, string>;
} | null {
  if (!setCookieHeader) return null;
  
  const parts = setCookieHeader.split(';');
  const [nameValue, ...attrs] = parts;
  const [name, ...valueParts] = nameValue.split('=');
  
  const attributes: Record<string, string> = {};
  attrs.forEach(attr => {
    const [key, val] = attr.trim().split('=');
    attributes[key.toLowerCase()] = val || 'true';
  });
  
  return {
    name: name.trim(),
    value: valueParts.join('=').trim(),
    attributes,
  };
}
