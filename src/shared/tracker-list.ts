// Curated list of known tracking domains from EasyPrivacy
// This is a subset focused on the most common trackers
// Full list: https://easylist.to/easylist/easyprivacy.txt

export const TRACKER_DOMAINS: Set<string> = new Set([
  // Google Analytics & Ads
  'google-analytics.com',
  'googleadservices.com',
  'googlesyndication.com',
  'googletagmanager.com',
  'googletagservices.com',
  'doubleclick.net',
  'googlesyndication.com',
  'googleads.g.doubleclick.net',
  'pagead2.googlesyndication.com',
  'analytics.google.com',
  
  // Facebook
  'facebook.com',
  'facebook.net',
  'fbcdn.net',
  'connect.facebook.net',
  'pixel.facebook.com',
  
  // Twitter/X
  'ads-twitter.com',
  'analytics.twitter.com',
  't.co',
  
  // Microsoft/Bing
  'bat.bing.com',
  'clarity.ms',
  'c.bing.com',
  
  // Amazon
  'amazon-adsystem.com',
  'assoc-amazon.com',
  
  // Adobe
  'demdex.net',
  'omtrdc.net',
  '2o7.net',
  
  // Other Major Ad Networks
  'adnxs.com',
  'adsrvr.org',
  'criteo.com',
  'criteo.net',
  'outbrain.com',
  'taboola.com',
  'pubmatic.com',
  'rubiconproject.com',
  'openx.net',
  'casalemedia.com',
  'advertising.com',
  'bidswitch.net',
  'indexww.com',
  
  // Analytics Providers
  'hotjar.com',
  'mouseflow.com',
  'fullstory.com',
  'crazyegg.com',
  'optimizely.com',
  'mixpanel.com',
  'segment.io',
  'segment.com',
  'amplitude.com',
  'heap.io',
  'heapanalytics.com',
  'newrelic.com',
  'nr-data.net',
  
  // Social Widgets & Tracking
  'addthis.com',
  'sharethis.com',
  'addtoany.com',
  'disqus.com',
  'disquscdn.com',
  
  // Data Brokers & DMPs
  'bluekai.com',
  'exelator.com',
  'liveramp.com',
  'acxiom.com',
  'tapad.com',
  'rlcdn.com',
  'liadm.com',
  'pippio.com',
  
  // Retargeting
  'perfectaudience.com',
  'adroll.com',
  'steelhousemedia.com',
  
  // Mobile Analytics
  'adjust.com',
  'appsflyer.com',
  'branch.io',
  'kochava.com',
  'singular.net',
  
  // Session Recording
  'logrocket.com',
  'smartlook.com',
  'inspectlet.com',
  
  // A/B Testing
  'abtasty.com',
  'vwo.com',
  'omniconvert.com',
  
  // Customer Data Platforms
  'rudderstack.com',
  'mparticle.com',
  'lytics.io',
  
  // Additional Common Trackers
  'quantserve.com',
  'scorecardresearch.com',
  'imrworldwide.com',
  'chartbeat.com',
  'parsely.com',
  'comscore.com',
  'moatads.com',
  'doubleverify.com',
  'adsafeprotected.com',
]);

/**
 * Check if a domain is a known tracker
 * Checks both the exact domain and parent domains
 */
export function isTrackerDomain(domain: string): boolean {
  // Normalize domain
  const normalizedDomain = domain.toLowerCase().replace(/^www\./, '');
  
  // Check exact match
  if (TRACKER_DOMAINS.has(normalizedDomain)) {
    return true;
  }
  
  // Check parent domains (e.g., analytics.google.com -> google.com)
  const parts = normalizedDomain.split('.');
  for (let i = 1; i < parts.length - 1; i++) {
    const parentDomain = parts.slice(i).join('.');
    if (TRACKER_DOMAINS.has(parentDomain)) {
      return true;
    }
  }
  
  return false;
}
