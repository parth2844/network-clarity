# System Patterns: Network Clarity

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Chrome Browser                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────┐    ┌──────────────────┐    ┌───────────────┐ │
│  │  Service Worker  │───▶│   Zustand Store  │◀───│    Popup      │ │
│  │  (Background)    │    │   (Shared State) │    │  (React App)  │ │
│  └────────┬─────────┘    └────────┬─────────┘    └───────────────┘ │
│           │                       │                                  │
│           │                       │                                  │
│           ▼                       ▼                                  │
│  ┌──────────────────┐    ┌──────────────────┐                       │
│  │ chrome.webRequest│    │  DevTools Panel  │                       │
│  │       API        │    │   (React App)    │                       │
│  └──────────────────┘    └──────────────────┘                       │
│                                  │                                   │
│                                  ▼                                   │
│                         ┌──────────────────┐                        │
│                         │chrome.devtools   │                        │
│                         │  .network API    │                        │
│                         └──────────────────┘                        │
└─────────────────────────────────────────────────────────────────────┘
```

## Component Relationships

### 1. Service Worker (Background Script)
**Role**: Central data collector and processor
**Responsibilities**:
- Listen to `chrome.webRequest` events
- Classify requests (first-party, third-party, tracker)
- Store request metadata per tab
- Respond to messages from popup and panel
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
- Provide "Open Advanced View" action

**Data Access**: Messages service worker for current tab's request data

### 3. DevTools Panel (Advanced Mode)
**Role**: Detailed request inspection
**Responsibilities**:
- Display full request list
- Show request/response details
- Format and display JSON responses
- Provide search and filter

**Data Access**: 
- `chrome.devtools.network` for response bodies
- Messages service worker for metadata

## Data Flow

### Request Capture Flow
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

### Popup Data Flow
```
User clicks extension icon
        │
        ▼
Popup sends message: { type: 'GET_TAB_DATA', tabId }
        │
        ▼
Service Worker responds with aggregated data
        │
        ▼
Popup renders dashboard
```

### DevTools Panel Data Flow
```
User opens DevTools → Network Clarity tab
        │
        ▼
Panel subscribes to chrome.devtools.network.onRequestFinished
        │
        ▼
For each request:
  - Capture response body via getContent()
  - Request metadata from Service Worker
  - Store in panel's local state
        │
        ▼
Panel renders request list with full details
```

## State Management

### Zustand Store Structure
```typescript
interface RequestStore {
  // Request data per tab
  requests: Map<number, NetworkRequest[]>;
  
  // Aggregated stats per tab
  stats: Map<number, TabStats>;
  
  // Actions
  addRequest: (tabId: number, request: NetworkRequest) => void;
  clearTab: (tabId: number) => void;
  getTabData: (tabId: number) => { requests: NetworkRequest[], stats: TabStats };
}

interface NetworkRequest {
  id: string;
  url: string;
  method: string;
  type: RequestType;
  status: number;
  statusText: string;
  domain: string;
  isThirdParty: boolean;
  isTracker: boolean;
  timing: RequestTiming;
  requestHeaders?: Header[];
  responseHeaders?: Header[];
  requestBody?: string;
  responseBody?: string; // Only available in DevTools
}

interface TabStats {
  totalRequests: number;
  firstPartyCount: number;
  thirdPartyCount: number;
  trackerCount: number;
  trackerDomains: string[];
}
```

## Key Technical Decisions

### 1. Manifest V3 Compliance
Chrome requires Manifest V3 for new extensions. Key implications:
- Service Worker instead of background page (no persistent state)
- Use `chrome.storage` for persistence if needed
- `declarativeNetRequest` for blocking (not needed for v1)

### 2. Response Body Access
Response bodies are only accessible via `chrome.devtools.network` when DevTools is open. This constraint shapes the two-mode design:
- Popup works without DevTools (metadata only)
- Panel requires DevTools (full response access)

### 3. Tracker Detection
Using EasyPrivacy list domains embedded in the extension:
- Static list bundled at build time
- No external network calls
- Updated via extension updates

### 4. Data Lifecycle
- Data resets on page navigation (matches user expectation)
- No persistence to disk (privacy)
- Memory cleared when tab closes

## Component File Structure

```
src/
├── background/
│   └── service-worker.ts      # Request interception, classification
├── popup/
│   ├── index.html             # Popup entry HTML
│   ├── index.tsx              # React mount point
│   └── Popup.tsx              # Main popup component
├── devtools/
│   ├── devtools.html          # DevTools entry HTML
│   ├── devtools.ts            # Panel registration
│   ├── panel.html             # Panel entry HTML
│   ├── panel-index.tsx        # React mount point
│   └── Panel.tsx              # Main panel component
├── components/
│   ├── Dashboard/             # Popup dashboard components
│   ├── RequestList/           # Request list for panel
│   ├── RequestDetail/         # Expandable detail view
│   └── JsonViewer/            # JSON formatting component
├── shared/
│   ├── types.ts               # TypeScript interfaces
│   ├── tracker-list.ts        # EasyPrivacy domains
│   ├── explanations.ts        # HTTP code/header explanations
│   └── utils.ts               # Domain parsing, classification
└── stores/
    └── requestStore.ts        # Zustand store definition
```

## Message Protocol

### Service Worker Messages

```typescript
// Request tab data
{ type: 'GET_TAB_DATA', tabId: number }
// Response: { requests: NetworkRequest[], stats: TabStats }

// Clear tab data
{ type: 'CLEAR_TAB', tabId: number }
// Response: { success: boolean }

// Get current tab ID (from popup)
{ type: 'GET_CURRENT_TAB' }
// Response: { tabId: number }
