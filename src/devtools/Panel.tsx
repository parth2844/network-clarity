import { useEffect, useState, useCallback } from 'react';
import { NetworkRequest } from '../shared/types';
import { truncateUrl, formatDuration, formatBytes } from '../shared/utils';
import { getStatusExplanation, getTypeExplanation } from '../shared/explanations';
import JsonViewer, { tryParseJson } from '../components/JsonViewer';
import CookieInspector from '../components/CookieInspector';
import CollapsibleSection from '../components/CollapsibleSection';

// Store HAR request objects to fetch content later
const harRequestMap = new Map<string, chrome.devtools.network.Request>();

function Panel() {
  const [requests, setRequests] = useState<NetworkRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<NetworkRequest | null>(null);
  const [filter, setFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [responseBody, setResponseBody] = useState<string | null>(null);
  const [loadingBody, setLoadingBody] = useState(false);
  const [requestCookies, setRequestCookies] = useState<string | null>(null);
  const [responseCookies, setResponseCookies] = useState<string[]>([]);
  const [requestBody, setRequestBody] = useState<string | null>(null);
  const [requestBodyMimeType, setRequestBodyMimeType] = useState<string | null>(null);
  const [responseSearch, setResponseSearch] = useState('');
  const [searchResults, setSearchResults] = useState<Set<string>>(new Set());
  const [isSearching, setIsSearching] = useState(false);
  const [responseCache, setResponseCache] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    // Listen for network requests via DevTools API
    const handleRequest = (harRequest: chrome.devtools.network.Request) => {
      const request: NetworkRequest = {
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        url: harRequest.request.url,
        method: harRequest.request.method,
        type: (harRequest._resourceType as NetworkRequest['type']) || 'other',
        status: harRequest.response.status,
        statusText: harRequest.response.statusText,
        domain: new URL(harRequest.request.url).hostname,
        isThirdParty: false, // Will be calculated
        isTracker: false, // Will be calculated
        timing: {
          startTime: new Date(harRequest.startedDateTime).getTime(),
          duration: harRequest.time,
        },
        size: harRequest.response.content.size,
        mimeType: harRequest.response.content.mimeType,
      };

      // Get page URL for classification
      const tabId = chrome.devtools.inspectedWindow.tabId;
      chrome.tabs.get(tabId, (tab) => {
        if (tab.url) {
          const pageDomain = new URL(tab.url).hostname;
          const requestDomain = request.domain;
          
          // Simple third-party check
          request.isThirdParty = !requestDomain.endsWith(pageDomain) && !pageDomain.endsWith(requestDomain);
          
          // Check tracker list (simplified - import from shared would be better)
          const trackerDomains = ['google-analytics.com', 'doubleclick.net', 'facebook.net', 'googletagmanager.com'];
          request.isTracker = trackerDomains.some(t => requestDomain.includes(t));
        }
        
        // Store HAR request for content fetching
        harRequestMap.set(request.id, harRequest);
        setRequests(prev => [...prev, request]);
        
        // Pre-fetch response body for search (for API calls)
        if (request.type === 'xmlhttprequest' || request.mimeType?.includes('json')) {
          harRequest.getContent((content) => {
            if (content) {
              setResponseCache(prev => new Map(prev).set(request.id, content));
            }
          });
        }
      });
    };

    chrome.devtools.network.onRequestFinished.addListener(handleRequest);

    // Clear requests when page navigates (refresh or new URL)
    const handleNavigated = () => {
      setRequests([]);
      setSelectedRequest(null);
      setResponseBody(null);
      setResponseCache(new Map());
      setSearchResults(new Set());
      setResponseSearch('');
      harRequestMap.clear();
    };
    chrome.devtools.network.onNavigated.addListener(handleNavigated);

    // Get existing requests
    chrome.devtools.network.getHAR((harLog) => {
      const existingRequests: NetworkRequest[] = harLog.entries.map((entry, index) => ({
        id: `existing-${index}`,
        url: entry.request.url,
        method: entry.request.method,
        type: ((entry as unknown as { _resourceType?: string })._resourceType as NetworkRequest['type']) || 'other',
        status: entry.response.status,
        statusText: entry.response.statusText,
        domain: new URL(entry.request.url).hostname,
        isThirdParty: false,
        isTracker: false,
        timing: {
          startTime: new Date(entry.startedDateTime).getTime(),
          duration: entry.time,
        },
        size: entry.response.content.size,
        mimeType: entry.response.content.mimeType,
      }));
      
      setRequests(existingRequests);
    });

    return () => {
      chrome.devtools.network.onRequestFinished.removeListener(handleRequest);
      chrome.devtools.network.onNavigated.removeListener(handleNavigated);
    };
  }, []);

  // Filter requests
  const filteredRequests = requests.filter(req => {
    const matchesSearch = filter === '' || 
      req.url.toLowerCase().includes(filter.toLowerCase()) ||
      req.domain.toLowerCase().includes(filter.toLowerCase());
    
    const matchesType = typeFilter === 'all' || req.type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  // Fetch response body and cookies when request is selected
  const fetchRequestDetails = useCallback((request: NetworkRequest) => {
    const harRequest = harRequestMap.get(request.id);
    if (!harRequest) {
      setResponseBody(null);
      setRequestCookies(null);
      setResponseCookies([]);
      setRequestBody(null);
      setRequestBodyMimeType(null);
      return;
    }

    // Get request body (POST data)
    const postData = harRequest.request.postData;
    if (postData?.text) {
      setRequestBody(postData.text);
      setRequestBodyMimeType(postData.mimeType || null);
    } else if (postData?.params && postData.params.length > 0) {
      // Form data - convert to readable format
      const formData = postData.params
        .map(p => `${p.name}=${p.value || ''}`)
        .join('\n');
      setRequestBody(formData);
      setRequestBodyMimeType('application/x-www-form-urlencoded');
    } else {
      setRequestBody(null);
      setRequestBodyMimeType(null);
    }

    // Get cookies from headers
    const cookieHeader = harRequest.request.headers.find(
      h => h.name.toLowerCase() === 'cookie'
    );
    setRequestCookies(cookieHeader?.value || null);

    // Get Set-Cookie headers from response
    const setCookieHeaders = harRequest.response.headers
      .filter(h => h.name.toLowerCase() === 'set-cookie')
      .map(h => h.value);
    setResponseCookies(setCookieHeaders);

    // Fetch body
    setLoadingBody(true);
    harRequest.getContent((content, _encoding) => {
      setResponseBody(content || null);
      setLoadingBody(false);
    });
  }, []);

  // Handle request selection
  const handleSelectRequest = useCallback((request: NetworkRequest) => {
    setSelectedRequest(request);
    setResponseBody(null);
    setRequestCookies(null);
    setResponseCookies([]);
    setRequestBody(null);
    setRequestBodyMimeType(null);
    fetchRequestDetails(request);
  }, [fetchRequestDetails]);

  const clearRequests = () => {
    setRequests([]);
    setSelectedRequest(null);
    setResponseBody(null);
    setRequestCookies(null);
    setResponseCookies([]);
    setRequestBody(null);
    setRequestBodyMimeType(null);
    setResponseCache(new Map());
    setSearchResults(new Set());
    setResponseSearch('');
    harRequestMap.clear();
  };

  // Search through response bodies
  const searchResponses = useCallback(async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setSearchResults(new Set());
      return;
    }

    setIsSearching(true);
    const matches = new Set<string>();
    const searchLower = searchTerm.toLowerCase();

    // Search through cached responses first
    responseCache.forEach((content, requestId) => {
      if (content.toLowerCase().includes(searchLower)) {
        matches.add(requestId);
      }
    });

    // Fetch and search remaining responses
    const uncachedRequests = requests.filter(r => !responseCache.has(r.id));
    
    await Promise.all(
      uncachedRequests.map(request => {
        return new Promise<void>((resolve) => {
          const harRequest = harRequestMap.get(request.id);
          if (!harRequest) {
            resolve();
            return;
          }

          harRequest.getContent((content) => {
            if (content) {
              setResponseCache(prev => new Map(prev).set(request.id, content));
              if (content.toLowerCase().includes(searchLower)) {
                matches.add(request.id);
              }
            }
            resolve();
          });
        });
      })
    );

    setSearchResults(matches);
    setIsSearching(false);
  }, [requests, responseCache]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      searchResponses(responseSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [responseSearch, searchResponses]);

  return (
    <div className="h-screen flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-2 border-b border-gray-200 bg-gray-50">
        <button
          onClick={clearRequests}
          className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100"
        >
          Clear
        </button>
        
        <input
          type="text"
          placeholder="Filter by URL..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="flex-1 px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        
        <div className="relative">
          <input
            type="text"
            placeholder="🔍 Search responses..."
            value={responseSearch}
            onChange={(e) => setResponseSearch(e.target.value)}
            className={`w-48 px-3 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-purple-500 ${
              searchResults.size > 0 ? 'border-purple-400 bg-purple-50' : 'border-gray-300'
            }`}
          />
          {isSearching && (
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">
              ⏳
            </span>
          )}
        </div>
        
        {searchResults.size > 0 && (
          <span className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded">
            Found in {searchResults.size} {searchResults.size === 1 ? 'response' : 'responses'}
          </span>
        )}
        
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-1 text-sm border border-gray-300 rounded bg-white"
        >
          <option value="all">All Types</option>
          <option value="xmlhttprequest">API Calls</option>
          <option value="script">Scripts</option>
          <option value="stylesheet">Stylesheets</option>
          <option value="image">Images</option>
          <option value="font">Fonts</option>
          <option value="media">Media</option>
          <option value="other">Other</option>
        </select>
        
        <div className="text-sm text-gray-500">
          {filteredRequests.length} requests
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Request List */}
        <div className="w-1/2 border-r border-gray-200 overflow-auto">
          {/* Header */}
          <div className="grid grid-cols-12 gap-2 px-3 py-2 text-xs font-semibold text-gray-500 bg-gray-100 border-b border-gray-200 sticky top-0">
            <div className="col-span-5">URL</div>
            <div className="col-span-2">Type</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-1">Size</div>
            <div className="col-span-2">Time</div>
          </div>

          {/* Rows */}
          {filteredRequests.map((request) => (
            <div
              key={request.id}
              onClick={() => handleSelectRequest(request)}
              className={`grid grid-cols-12 gap-2 px-3 py-2 text-xs request-row ${
                selectedRequest?.id === request.id ? 'selected' : ''
              } ${searchResults.has(request.id) ? 'search-match' : ''} ${request.isTracker ? 'tracker' : request.isThirdParty ? 'third-party' : ''}`}
            >
              <div className="col-span-5 truncate" title={request.url}>
                <span className="font-medium text-gray-600">{request.method}</span>{' '}
                {truncateUrl(request.url, 40)}
              </div>
              <div className="col-span-2 text-gray-500" title={getTypeExplanation(request.type).description}>
                {getTypeExplanation(request.type).icon} {getTypeExplanation(request.type).name}
              </div>
              <div className={`col-span-2 ${
                request.status >= 400 ? 'text-red-600' : 
                request.status >= 300 ? 'text-yellow-600' : 'text-green-600'
              }`}>
                {request.status || 'Pending'}
              </div>
              <div className="col-span-1 text-gray-500">
                {request.size ? formatBytes(request.size) : '-'}
              </div>
              <div className="col-span-2 text-gray-500">
                {request.timing.duration ? formatDuration(request.timing.duration) : '-'}
              </div>
            </div>
          ))}

          {filteredRequests.length === 0 && (
            <div className="flex items-center justify-center h-32 text-gray-500">
              No requests captured
            </div>
          )}
        </div>

        {/* Request Details */}
        <div className="w-1/2 overflow-auto">
          {selectedRequest ? (
            <div className="p-4">
              <h2 className="text-sm font-semibold mb-4">Request Details</h2>
              
              {/* URL */}
              <div className="mb-4">
                <label className="text-xs text-gray-500">URL</label>
                <div className="text-sm break-all bg-gray-50 p-2 rounded">
                  {selectedRequest.url}
                </div>
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-xs text-gray-500">Method</label>
                  <div className="text-sm font-medium">{selectedRequest.method}</div>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Status</label>
                  {(() => {
                    const statusInfo = getStatusExplanation(selectedRequest.status);
                    return (
                      <div>
                        <div className={`text-sm font-medium ${
                          statusInfo.isError ? 'text-red-600' : statusInfo.isWarning ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                          {selectedRequest.status} - {statusInfo.summary}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {statusInfo.detail}
                        </div>
                      </div>
                    );
                  })()}
                </div>
                <div>
                  <label className="text-xs text-gray-500">Type</label>
                  {(() => {
                    const typeInfo = getTypeExplanation(selectedRequest.type);
                    return (
                      <div>
                        <div className="text-sm">{typeInfo.icon} {typeInfo.name}</div>
                        <div className="text-xs text-gray-500 mt-1">{typeInfo.description}</div>
                      </div>
                    );
                  })()}
                </div>
                <div>
                  <label className="text-xs text-gray-500">Domain</label>
                  <div className="text-sm">{selectedRequest.domain}</div>
                </div>
              </div>

              {/* Classification */}
              <div className="flex gap-2 mb-4">
                {selectedRequest.isTracker && (
                  <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded">
                    Known Tracker
                  </span>
                )}
                {selectedRequest.isThirdParty && (
                  <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded">
                    Third Party
                  </span>
                )}
                {!selectedRequest.isThirdParty && !selectedRequest.isTracker && (
                  <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">
                    First Party
                  </span>
                )}
              </div>

              {/* Timing */}
              <div className="mb-4">
                <label className="text-xs text-gray-500">Timing</label>
                <div className="text-sm">
                  {selectedRequest.timing.duration 
                    ? formatDuration(selectedRequest.timing.duration)
                    : 'Unknown'}
                </div>
              </div>

              {/* Size */}
              {selectedRequest.size && (
                <div className="mb-4">
                  <label className="text-xs text-gray-500">Size</label>
                  <div className="text-sm">{formatBytes(selectedRequest.size)}</div>
                </div>
              )}

              {/* MIME Type */}
              {selectedRequest.mimeType && (
                <div className="mb-4">
                  <label className="text-xs text-gray-500">Content Type</label>
                  <div className="text-sm">{selectedRequest.mimeType}</div>
                </div>
              )}

              {/* Cookies */}
              <CollapsibleSection 
                title="🍪 Cookies" 
                defaultExpanded={true}
                className="mt-6"
              >
                <CookieInspector 
                  requestCookies={requestCookies}
                  responseCookies={responseCookies}
                />
              </CollapsibleSection>

              {/* Request Body */}
              {requestBody && (
                <div className="mt-6 border-t pt-4">
                  <label className="text-xs text-gray-500 font-semibold">📤 Request Body</label>
                  {requestBodyMimeType && (
                    <span className="ml-2 text-xs text-gray-400">({requestBodyMimeType})</span>
                  )}
                  <div className="mt-2 bg-blue-50 rounded p-2 max-h-64 overflow-auto border border-blue-200">
                    {(() => {
                      // Try to parse as JSON
                      const jsonResult = tryParseJson(requestBody);
                      if (jsonResult.success) {
                        return <JsonViewer data={jsonResult.data} />;
                      }
                      // Show as plain text (form data or other)
                      return (
                        <pre className="text-xs whitespace-pre-wrap break-all">
                          {requestBody.length > 3000 
                            ? requestBody.substring(0, 3000) + '\n\n... (truncated)'
                            : requestBody}
                        </pre>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* Response Body */}
              <div className="mt-6 border-t pt-4">
                <label className="text-xs text-gray-500 font-semibold">Response Body</label>
                {loadingBody ? (
                  <div className="text-sm text-gray-400 mt-2">Loading...</div>
                ) : responseBody ? (
                  <div className="mt-2 bg-gray-50 rounded p-2 max-h-96 overflow-auto">
                    {(() => {
                      // Try to parse as JSON
                      const jsonResult = tryParseJson(responseBody);
                      if (jsonResult.success) {
                        return <JsonViewer data={jsonResult.data} />;
                      }
                      // Show as plain text
                      return (
                        <pre className="text-xs whitespace-pre-wrap break-all">
                          {responseBody.length > 5000 
                            ? responseBody.substring(0, 5000) + '\n\n... (truncated)'
                            : responseBody}
                        </pre>
                      );
                    })()}
                  </div>
                ) : (
                  <div className="text-sm text-gray-400 mt-2">
                    No response body available
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Select a request to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Panel;
