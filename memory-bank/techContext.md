# Tech Context: Network Clarity

## Technology Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| Language | TypeScript | 5.x |
| UI Framework | React | 18.x |
| Build Tool | Vite | 5.x |
| Extension Build | @crxjs/vite-plugin | 2.x |
| CSS Framework | Tailwind CSS | 3.x |
| State Management | Zustand | 4.x |
| Extension Manifest | Chrome Manifest V3 | - |

## Development Environment

### Prerequisites
- Node.js 18+ 
- npm 9+
- Chrome browser (for testing)

### Project Initialization
```bash
npm create vite@latest network-clarity -- --template react-ts
cd network-clarity
npm install
npm install -D @crxjs/vite-plugin@beta tailwindcss postcss autoprefixer
npm install zustand
```

### Build Commands
```bash
npm run dev      # Development build with HMR
npm run build    # Production build
npm run preview  # Preview production build
```

## Chrome Extension Configuration

### Manifest V3 Structure
```json
{
  "manifest_version": 3,
  "name": "Network Clarity",
  "version": "1.0.0",
  "description": "Understand website network activity in plain English",
  "permissions": [
    "webRequest",
    "activeTab",
    "tabs"
  ],
  "host_permissions": ["<all_urls>"],
  "background": {
    "service_worker": "src/background/service-worker.ts",
    "type": "module"
  },
  "action": {
    "default_popup": "src/popup/index.html",
    "default_icon": {
      "16": "icons/icon16.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png"
    }
  },
  "devtools_page": "src/devtools/devtools.html",
  "icons": {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  }
}
```

### Key Permissions
- `webRequest`: Intercept and observe network requests
- `activeTab`: Access current tab URL for first/third-party classification
- `tabs`: Query tab information for badge updates

## Dependencies

### Production Dependencies
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "zustand": "^4.5.0"
}
```

### Development Dependencies
```json
{
  "@crxjs/vite-plugin": "^2.0.0-beta.23",
  "@types/chrome": "^0.0.260",
  "@types/react": "^18.2.0",
  "@types/react-dom": "^18.2.0",
  "autoprefixer": "^10.4.17",
  "postcss": "^8.4.35",
  "tailwindcss": "^3.4.1",
  "typescript": "^5.3.0",
  "vite": "^5.1.0"
}
```

## Technical Constraints

### Chrome Extension Limitations
1. **Service Worker Lifecycle**: Service workers can be terminated at any time; must not rely on persistent in-memory state for long periods
2. **Response Body Access**: Only available via `chrome.devtools.network` when DevTools is open
3. **Popup Persistence**: Popup closes when user clicks elsewhere; state must be stored in service worker or chrome.storage
4. **Content Security Policy**: Extensions have strict CSP; no inline scripts, no eval()

### Manifest V3 Changes
- Background scripts replaced with service workers
- `webRequestBlocking` removed (not needed for this project)
- Host permissions now separate from permissions array

## Build Configuration

### Vite Configuration (vite.config.ts)
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { crx } from '@crxjs/vite-plugin'
import manifest from './public/manifest.json'

export default defineConfig({
  plugins: [
    react(),
    crx({ manifest }),
  ],
  build: {
    rollupOptions: {
      input: {
        popup: 'src/popup/index.html',
        panel: 'src/devtools/panel.html',
        devtools: 'src/devtools/devtools.html',
      },
    },
  },
})
```

### TypeScript Configuration
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### Tailwind Configuration
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,html}",
  ],
  theme: {
    extend: {
      colors: {
        'first-party': '#22c55e',    // green-500
        'third-party': '#eab308',     // yellow-500
        'tracker': '#ef4444',         // red-500
      },
    },
  },
  plugins: [],
}
```

## Loading Extension in Chrome

### Development
1. Run `npm run dev`
2. Open `chrome://extensions`
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select `dist` folder

### Production
1. Run `npm run build`
2. Zip `dist` folder
3. Upload to Chrome Web Store (or load unpacked for personal use)

## Debugging

### Service Worker
- Open `chrome://extensions`
- Find Network Clarity
- Click "Service Worker" link to open DevTools for background script

### Popup
- Right-click extension icon → "Inspect popup"

### DevTools Panel
- Standard DevTools debugging (panel runs in DevTools context)

## External Resources

### Tracker Lists
- EasyPrivacy: https://easylist.to/easylist/easyprivacy.txt
- Domain list extracted and embedded at build time
- ~5000 tracking domains

### Documentation
- Chrome Extension API: https://developer.chrome.com/docs/extensions/reference/
- Manifest V3 Migration: https://developer.chrome.com/docs/extensions/mv3/intro/
- @crxjs/vite-plugin: https://crxjs.dev/vite-plugin/
