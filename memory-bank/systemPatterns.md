# System Patterns: Network Clarity

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Chrome Browser                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────┐                        ┌───────────────┐      │
│  │  Service Worker  │◀──── Messages ────────▶│    Popup      │      │
│  │  (Background)    │                        │  (React App)  │      │
│  └────────┬─────────┘                        └───────────────┘      │
│           │                                                          │
│           │ chrome.webRequest                                        │
│           ▼                                                          │
│  ┌──────────────────┐                                               │
│  │  Request Data    │                                               │
│  │  (In-Memory)     │                                               │
│  └──────────────────┘                                               │
│                                                                      │
│  ┌──────────────────┐    ┌──────────────────┐                       │
│  │  DevTools Panel  │───▶│chrome.devtools   │                       │
│  │   (React App)    │    │  .network API    │                       │
│  └──────────────────┘    └──────────────────┘                       │
└─────────────────────────────────────────────────────────────────────┘
```

## Component Relationships

### 1. Service Worker (Background Script)
**Role**: Central data collector for popup
**Responsibilities**:
- Listen to `chrome.webRequest` events
- Classify requests (first-party, third-party, tracker)
- Store request metadata per tab
- Respond to messages from popup
- Update badge count

**Key APIs**:
- `chrome.webRequest.onBeforeRequest`
- `chrome.webRequest.onCompleted`
- `chrome.webRequest.onHeadersReceived`
- `chrome.runtime.onMessage`
- `chrome.action.setBadgeText`

### 2. Popup (Simple Mode)
**Role**: Quick summary dashboard
**Responsibilities**:
- Display aggregated statistics
- Show tracker count and list
- Provide privacy summary

**Data Access**: Messages service worker for current tab's request data

### 3. DevTools Panel (Advanced Mode)
**Role**: Detailed request inspection
**Responsibilities**:
- Display full request list with filtering
- Show request/response details with explanations
- Format and display JSON responses
- Cookie inspection with risk analysis
- Response body search

**Data Access**: 
- `chrome.devtools.network` for HAR data including response bodies
- `chrome.devtools.network.getHAR()` for existing requests
- `chrome.devtools.network.onRequestFinished` for new requests

## Data Flow

### Request Capture Flow (Service Worker)
```
Website makes request
        │
        ▼
Service Worker intercepts via chrome.webRequest
        │
        ▼
Extract: URL, method, headers, timing, type
        │
        ▼
Classify: First-party / Third-party / Tracker
        │
        ▼
Store in memory (keyed by tabId)
        │
        ▼
Update badge count
```

### DevTools Panel Data Flow
```
User opens DevTools → Network Clarity tab
        │
        ▼
Panel calls chrome.devtools.network.getHAR()
        │
        ▼
Load existing requests into local state
        │
        ▼
Subscribe to chrome.devtools.network.onRequestFinished
        │
        ▼
For each new request:
  - Store HAR request object for content access
  - Extract metadata (URL, status, timing, size)
  - Classify domain (first-party/third-party/tracker)
  - Add to local state
        │
        ▼
On request selection:
  - Fetch response body via harRequest.getContent()
  - Parse cookies from headers
  - Display full details with explanations
```

### Response Search Flow
```
User types in response search box
        │
        ▼
Debounce (300ms)
        │
        ▼
Search cached response bodies
        │
        ▼
Fetch uncached responses via harRequest.getContent()
        │
        ▼
Cache fetched responses for future searches
        │
        ▼
Update searchResults Set with matching request IDs
        │
        ▼
Highlight matching requests in list
```

## State Management

### Local State (React useState)
Each component manages its own state. No global state management library.

**DevTools Panel State**:
```typescript
const [requests, setRequests] = useState<NetworkRequest[]>([]);
const [selectedRequest, setSelectedRequest] = useState<NetworkRequest | null>(null);
const [filter, setFilter] = useState('');
const [typeFilter, setTypeFilter] = useState<string>('all');
const [responseBody, setResponseBody] = useState<string | null>(null);
const [loadingBody, setLoadingBody] = useState(false);
const [requestCookies, setRequestCookies] = useState<string | null>(null);
const [responseCookies, setResponseCookies] = useState<string[]>([]);
const [responseSearch, setResponseSearch] = useState('');
const [searchResults, setSearchResults] = useState<Set<string>>(new Set());
const [isSearching, setIsSearching] = useState(false);
const [responseCache, setResponseCache] = useState<Map<string, string>>(new Map());
```

**HAR Request Storage**:
```typescript
// Store HAR request objects to fetch content later
const harRequestMap = new Map<string, chrome.devtools.network.Request>();
```

### Data Types

```typescript
interface NetworkRequest {
  id: string;
  url: string;
  method: string;
  type: 'document' | 'stylesheet' | 'script' | 'image' | 'font' | 
        'xmlhttprequest' | 'fetch' | 'media' | 'websocket' | 'other';
  status: number;
  statusText: string;
  domain: string;
  isThirdParty: boolean;
  isTracker: boolean;
  timing: {
    startTime: number;
    duration: number;
  };
  size?: number;
  mimeType?: string;
}
```

## Key Technical Decisions

### 1. No Global State Management
Decided against Zustand/Redux. React useState is sufficient because:
- DevTools panel is the primary data consumer
- Panel has direct access to `chrome.devtools.network`
- Popup only needs summary data from service worker
- No need to share state between popup and panel

### 2. HAR-Based Data in DevTools
DevTools panel uses HAR data directly from `chrome.devtools.network`:
- Provides response bodies (not available via webRequest)
- Includes full header information
- Has accurate timing data
- Stores HAR objects in Map for lazy content loading

### 3. Response Body Caching
Responses are cached when:
- User searches response bodies
- API calls (xmlhttprequest) are pre-fetched for faster search
- Cache persists until page navigation

## Component File Structure

```
src/
├── background/
│   └── service-worker.ts      # Request interception, badge updates
├── popup/
│   ├── index.html             # Popup entry HTML
│   ├── index.tsx              # React mount point
│   └── Popup.tsx              # Dashboard with stats
├── devtools/
│   ├── devtools.html          # DevTools entry HTML
│   ├── devtools.ts            # Panel registration
│   ├── panel.html             # Panel entry HTML
│   ├── panel-index.tsx        # React mount point
│   └── Panel.tsx              # Full request inspector
├── components/
│   ├── JsonViewer.tsx         # Collapsible JSON tree
│   └── CookieInspector.tsx    # Cookie analysis display
├── shared/
│   ├── types.ts               # TypeScript interfaces
│   ├── tracker-list.ts        # Known tracker domains
│   ├── explanations.ts        # HTTP status/type/header explanations
│   ├── cookie-explanations.ts # Cookie patterns and categories
│   └── utils.ts               # URL formatting, bytes, duration helpers
└── styles/
    ├── index.css              # Global styles
    └── panel.css              # Panel-specific styles
```

## Message Protocol

### Service Worker Messages (Popup)

```typescript
// Get stats for current tab
{ type: 'GET_STATS' }
// Response: { total, firstParty, thirdParty, trackers, trackerDomains }

// Clear data for tab
{ type: 'CLEAR_TAB', tabId: number }
// Response: { success: boolean }
```

## UI Patterns

### Request Classification Colors
```css
.first-party { background: #dcfce7; }  /* green-100 */
.third-party { background: #fef9c3; }  /* yellow-100 */
.tracker { background: #fee2e2; }       /* red-100 */
```

### Cookie Risk Colors
```css
.risk-low { border-color: #d1d5db; background: #f9fafb; }    /* gray */
.risk-medium { border-color: #fde047; background: #fefce8; } /* yellow */
.risk-high { border-color: #fca5a5; background: #fef2f2; }   /* red */
```

### JSON Viewer Colors
```css
.json-key { color: #9333ea; }      /* purple-600 */
.json-string { color: #16a34a; }   /* green-600 */
.json-number { color: #2563eb; }   /* blue-600 */
.json-boolean { color: #ea580c; }  /* orange-600 */
.json-null { color: #6b7280; }     /* gray-500 */
