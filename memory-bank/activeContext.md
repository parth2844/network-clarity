# Active Context: Network Clarity

## Current Focus
**Phase 1: Foundation** - Setting up project infrastructure and basic extension scaffold.

## Recent Changes
- Created project directory structure
- Initialized git repository
- Created Memory Bank documentation files

## Next Steps
1. Initialize npm project with `package.json`
2. Install dependencies (React, Vite, Tailwind, Zustand, @crxjs/vite-plugin)
3. Configure Vite for Chrome extension builds
4. Create Chrome extension manifest.json
5. Set up TypeScript configuration
6. Create basic service worker with request interception
7. Create minimal popup and DevTools panel shells

## Active Decisions

### Build Tool Choice
Using @crxjs/vite-plugin for seamless Vite + Chrome extension integration. This handles:
- Hot Module Replacement during development
- Automatic manifest processing
- Multiple entry points (popup, panel, service worker)

### State Architecture
Service worker maintains request data in memory. Popup and panel communicate via `chrome.runtime.sendMessage`. This avoids complexity of shared Zustand stores across extension contexts.

### Tracker List Approach
Embedding a curated subset of EasyPrivacy domains directly in the extension rather than fetching at runtime. Tradeoff: List may become stale, but ensures privacy (no external calls) and reliability (no network dependency).

## Current Considerations

### Service Worker Persistence
Manifest V3 service workers can terminate when idle. Options:
1. Accept data loss on termination (simplest, acceptable for v1)
2. Use `chrome.storage.session` for persistence within browser session
3. Use `chrome.storage.local` for cross-session persistence

**Decision**: Start with option 1. If users report issues with data disappearing, implement option 2.

### DevTools Panel Registration
DevTools panels must be registered from a devtools.html page that runs when DevTools opens. The panel itself is a separate HTML page. This creates three entry points:
- `devtools.html` → `devtools.ts` (registers panel)
- `panel.html` → Panel React app
- `popup/index.html` → Popup React app

## Important Patterns

### Message Passing
All communication between popup/panel and service worker uses:
```typescript
chrome.runtime.sendMessage({ type: 'ACTION_NAME', payload })
```

Service worker listens with:
```typescript
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Handle message, call sendResponse with result
  return true; // Keep channel open for async response
})
```

### Domain Classification
```typescript
function isThirdParty(requestUrl: string, pageUrl: string): boolean {
  const requestDomain = new URL(requestUrl).hostname;
  const pageDomain = new URL(pageUrl).hostname;
  return getBaseDomain(requestDomain) !== getBaseDomain(pageDomain);
}
```

## Learnings & Insights
(To be updated as development progresses)
