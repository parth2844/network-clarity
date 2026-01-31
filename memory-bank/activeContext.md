# Active Context: Network Clarity

## Current Focus
**Phase 4: Polish & Documentation** - The core feature development is complete. Ready for testing and final polish.

## Recent Changes
- Completed HTTP status code explanations (full coverage)
- Completed request type explanations with icons
- Completed header explanations by category
- Implemented JSON Viewer component with collapsible tree
- Implemented Cookie Inspector with risk-based analysis
- Added response body search functionality
- All Phase 2-4 features implemented ahead of schedule

## What's Implemented

### DevTools Panel Features
1. **Request List** - Filterable by URL, type, with classification badges
2. **Request Details** - Full breakdown with plain-English explanations
3. **JSON Viewer** - Collapsible tree with color-coded values
4. **Cookie Inspector** - Risk levels, categories, attribute display
5. **Response Search** - Search across all response bodies

### Shared Utilities
- `src/shared/explanations.ts` - HTTP status, request types, headers
- `src/shared/cookie-explanations.ts` - Cookie patterns and categories
- `src/shared/tracker-list.ts` - ~100 known tracker domains
- `src/shared/utils.ts` - URL formatting, duration, bytes helpers
- `src/shared/types.ts` - TypeScript interfaces

### Components
- `src/components/JsonViewer.tsx` - Recursive JSON tree renderer
- `src/components/CookieInspector.tsx` - Cookie analysis display

## Next Steps
1. **Test extension in Chrome** - Load unpacked extension and verify functionality
2. **UI Polish** - Refine styling, improve accessibility
3. **Documentation** - Update README, add user guide
4. **Chrome Web Store** - Prepare assets for submission

## Active Decisions

### Build Tool Choice
Using @crxjs/vite-plugin for seamless Vite + Chrome extension integration. Handles:
- Hot Module Replacement during development
- Automatic manifest processing
- Multiple entry points (popup, panel, service worker, content script)

### State Architecture
Service worker maintains request data in memory. Popup and panel communicate via `chrome.runtime.sendMessage`. DevTools panel uses `chrome.devtools.network` API directly for richer HAR data.

### Tracker List Approach
Embedded curated subset of EasyPrivacy domains directly in the extension. Ensures privacy (no external calls) and reliability (no network dependency).

### Cookie Analysis Strategy
Pattern-based matching for known cookies (Google Analytics, Facebook, etc.) with fallback heuristics for unknown cookies based on name patterns.

## Current Considerations

### Service Worker Persistence
Using ephemeral in-memory storage for v1. Data clears when service worker terminates. Acceptable for MVP; can add `chrome.storage.session` if users report issues.

### DevTools Panel Data Source
DevTools panel uses `chrome.devtools.network.getHAR()` and `onRequestFinished` for rich request data including response bodies. This is more detailed than what the service worker captures.

## Important Patterns

### Message Passing
```typescript
// From popup/panel to service worker
chrome.runtime.sendMessage({ type: 'GET_STATS' }, (response) => { ... });

// Service worker listener
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_STATS') {
    sendResponse(stats);
  }
  return true; // Keep channel open for async
});
```

### Cookie Risk Classification
```typescript
// Risk levels based on cookie purpose
type CookieRisk = 'low' | 'medium' | 'high';
// low: essential, functional (session, auth, preferences)
// medium: analytics (Google Analytics, Mixpanel)
// high: advertising, tracking (Facebook Pixel, DoubleClick)
```

### JSON Viewer Recursion
```typescript
// Auto-collapse at depth > 2 for readability
const [expanded, setExpanded] = useState(initialExpanded && depth < 2);
```

## Learnings & Insights

### DevTools API Advantages
- `chrome.devtools.network` provides full HAR data including response bodies
- Can call `getContent()` on HAR entries to fetch response body lazily
- More complete than `chrome.webRequest` which lacks response bodies

### Cookie Parsing Complexity
- Cookie headers have specific format with semicolon-separated attributes
- Set-Cookie can have multiple entries per response
- Attribute parsing needs to handle various formats (with/without values)
