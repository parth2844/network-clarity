import { NetworkRequest, TabData, RequestType, Message } from '../shared/types';
import { classifyRequest, generateRequestId, getDomain } from '../shared/utils';

// Store request data per tab
const tabData: Map<number, TabData> = new Map();

// Store page URLs per tab for classification
const tabUrls: Map<number, string> = new Map();

/**
 * Initialize empty tab data
 */
function initTabData(tabId: number, pageUrl: string): TabData {
  const data: TabData = {
    requests: [],
    stats: {
      totalRequests: 0,
      firstPartyCount: 0,
      thirdPartyCount: 0,
      trackerCount: 0,
      trackerDomains: [],
      uniqueDomains: [],
    },
    pageUrl,
    pageDomain: getDomain(pageUrl),
  };
  tabData.set(tabId, data);
  return data;
}

/**
 * Update statistics for a tab
 */
function updateStats(data: TabData): void {
  const domains = new Set<string>();
  const trackerDomains = new Set<string>();
  let firstParty = 0;
  let thirdParty = 0;
  let trackers = 0;

  for (const request of data.requests) {
    domains.add(request.domain);
    
    if (request.isTracker) {
      trackers++;
      trackerDomains.add(request.domain);
    }
    
    if (request.isThirdParty) {
      thirdParty++;
    } else {
      firstParty++;
    }
  }

  data.stats = {
    totalRequests: data.requests.length,
    firstPartyCount: firstParty,
    thirdPartyCount: thirdParty,
    trackerCount: trackers,
    trackerDomains: Array.from(trackerDomains),
    uniqueDomains: Array.from(domains),
  };
}

/**
 * Update the badge for a tab
 */
function updateBadge(tabId: number, data: TabData): void {
  const trackerCount = data.stats.trackerCount;
  
  chrome.action.setBadgeText({
    tabId,
    text: trackerCount > 0 ? String(trackerCount) : '',
  });
  
  chrome.action.setBadgeBackgroundColor({
    tabId,
    color: trackerCount > 0 ? '#ef4444' : '#22c55e',
  });
}

/**
 * Handle incoming requests
 */
function handleRequest(
  details: chrome.webRequest.WebRequestDetails
): void {
  const { tabId, url, method, type, requestId, timeStamp } = details;
  
  // Ignore requests without a tab (e.g., service worker requests)
  if (tabId < 0) return;
  
  // Get or initialize tab data
  let data = tabData.get(tabId);
  const pageUrl = tabUrls.get(tabId) || '';
  
  if (!data) {
    data = initTabData(tabId, pageUrl);
  }
  
  // Classify the request
  const classification = classifyRequest(url, pageUrl);
  
  // Create request record
  const request: NetworkRequest = {
    id: requestId || generateRequestId(),
    url,
    method,
    type: type as RequestType,
    status: 0, // Will be updated on completion
    statusText: '',
    domain: classification.domain,
    isThirdParty: classification.isThirdParty,
    isTracker: classification.isTracker,
    timing: {
      startTime: timeStamp,
    },
  };
  
  data.requests.push(request);
  updateStats(data);
  updateBadge(tabId, data);
}

/**
 * Handle completed requests
 */
function handleCompleted(
  details: chrome.webRequest.WebResponseCacheDetails
): void {
  const { tabId, requestId, statusCode, timeStamp } = details;
  
  if (tabId < 0) return;
  
  const data = tabData.get(tabId);
  if (!data) return;
  
  // Find and update the request
  const request = data.requests.find(r => r.id === requestId);
  if (request) {
    request.status = statusCode;
    request.statusText = getStatusText(statusCode);
    request.timing.endTime = timeStamp;
    request.timing.duration = timeStamp - request.timing.startTime;
  }
}

/**
 * Handle request headers
 */
function handleRequestHeaders(
  details: chrome.webRequest.WebRequestHeadersDetails
): void {
  const { tabId, requestId, requestHeaders } = details;
  
  if (tabId < 0 || !requestHeaders) return;
  
  const data = tabData.get(tabId);
  if (!data) return;
  
  const request = data.requests.find(r => r.id === requestId);
  if (request) {
    request.requestHeaders = requestHeaders.map(h => ({
      name: h.name,
      value: h.value || '',
    }));
  }
}

/**
 * Handle response headers
 */
function handleResponseHeaders(
  details: chrome.webRequest.WebResponseHeadersDetails
): void {
  const { tabId, requestId, responseHeaders } = details;
  
  if (tabId < 0 || !responseHeaders) return;
  
  const data = tabData.get(tabId);
  if (!data) return;
  
  const request = data.requests.find(r => r.id === requestId);
  if (request) {
    request.responseHeaders = responseHeaders.map(h => ({
      name: h.name,
      value: h.value || '',
    }));
    
    // Extract content-type and content-length
    for (const header of responseHeaders) {
      if (header.name.toLowerCase() === 'content-type') {
        request.mimeType = header.value;
      }
      if (header.name.toLowerCase() === 'content-length') {
        request.size = parseInt(header.value || '0', 10);
      }
    }
  }
}

/**
 * Get status text for HTTP status code
 */
function getStatusText(statusCode: number): string {
  const statusTexts: Record<number, string> = {
    200: 'OK',
    201: 'Created',
    204: 'No Content',
    301: 'Moved Permanently',
    302: 'Found',
    304: 'Not Modified',
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    500: 'Internal Server Error',
    502: 'Bad Gateway',
    503: 'Service Unavailable',
  };
  
  return statusTexts[statusCode] || '';
}

// Set up webRequest listeners
chrome.webRequest.onBeforeRequest.addListener(
  handleRequest,
  { urls: ['<all_urls>'] }
);

chrome.webRequest.onCompleted.addListener(
  handleCompleted,
  { urls: ['<all_urls>'] }
);

chrome.webRequest.onSendHeaders.addListener(
  handleRequestHeaders,
  { urls: ['<all_urls>'] },
  ['requestHeaders']
);

chrome.webRequest.onHeadersReceived.addListener(
  handleResponseHeaders,
  { urls: ['<all_urls>'] },
  ['responseHeaders']
);

// Track page navigation to update page URL and clear data
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'loading' && tab.url) {
    // Clear old data on navigation
    tabUrls.set(tabId, tab.url);
    initTabData(tabId, tab.url);
    updateBadge(tabId, tabData.get(tabId)!);
  }
});

// Clean up when tab is closed
chrome.tabs.onRemoved.addListener((tabId) => {
  tabData.delete(tabId);
  tabUrls.delete(tabId);
});

// Handle messages from popup and panel
chrome.runtime.onMessage.addListener(
  (message: Message, _sender, sendResponse) => {
    switch (message.type) {
      case 'GET_TAB_DATA': {
        const tabId = message.tabId;
        if (tabId !== undefined) {
          const data = tabData.get(tabId);
          sendResponse({
            success: true,
            data: data || null,
          });
        } else {
          sendResponse({
            success: false,
            error: 'No tabId provided',
          });
        }
        break;
      }
      
      case 'CLEAR_TAB': {
        const tabId = message.tabId;
        if (tabId !== undefined) {
          const pageUrl = tabUrls.get(tabId) || '';
          initTabData(tabId, pageUrl);
          updateBadge(tabId, tabData.get(tabId)!);
          sendResponse({ success: true });
        } else {
          sendResponse({ success: false, error: 'No tabId provided' });
        }
        break;
      }
      
      case 'GET_CURRENT_TAB': {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0]?.id) {
            sendResponse({ tabId: tabs[0].id });
          } else {
            sendResponse({ tabId: -1 });
          }
        });
        return true; // Keep channel open for async response
      }
      
      default:
        sendResponse({ success: false, error: 'Unknown message type' });
    }
    
    return true; // Keep channel open for async response
  }
);

console.log('Network Clarity service worker initialized');
