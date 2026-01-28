# Network Clarity

A Chrome extension that helps you understand website network activity in plain English. Perfect for non-technical users who want to know what's happening behind the scenes when they visit websites.

![Network Clarity](https://img.shields.io/badge/Chrome-Extension-green) ![Version](https://img.shields.io/badge/version-1.0.0-blue) ![License](https://img.shields.io/badge/license-MIT-gray)

## ✨ Features

### 🎯 Element Picker
Click on any element on a webpage and instantly find which network request loaded it.
- Hover to see resource URLs
- Click to highlight the corresponding request
- Works with images, scripts, stylesheets, iframes, and background images

### 🔍 Search Responses
Find which API request returned specific data you see on the page.
- Type any text (e.g., a username, product name, or ID)
- All responses containing that text are highlighted in purple
- Perfect for answering "where did this data come from?"

### 🍪 Cookie Inspector
Understand what cookies websites are using and why.
- **30+ recognized cookies** (Google Analytics, Facebook Pixel, etc.)
- **Risk categories**: Low, Medium, High
- **Cookie types**: Essential, Functional, Analytics, Advertising, Tracking
- **Security flags**: HttpOnly, Secure, SameSite displayed

### 📊 Request Analysis
Every network request explained in simple terms:
- **HTTP Status Codes**: "200 - Success" instead of just "200"
- **Request Types**: 📡 API Call, 🎨 Styles, ⚡ Script, 🖼️ Image
- **Third-party detection**: Know which requests go to external services
- **Tracker identification**: Spot known tracking scripts

### 📝 JSON Response Viewer
Pretty-printed JSON responses with:
- Syntax highlighting
- Collapsible objects and arrays
- Color-coded values (strings, numbers, booleans)

## 📦 Installation

### From Source (Developer Mode)

1. **Clone the repository**
   ```bash
   git clone https://github.com/parth2844/network-clarity.git
   cd network-clarity
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the extension**
   ```bash
   npm run build
   ```

4. **Load in Chrome**
   - Open `chrome://extensions`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist` folder

### From ZIP (No Development Setup)

See [DISTRIBUTION.md](DISTRIBUTION.md) for instructions on installing from a downloaded ZIP file.

## 🚀 Usage

1. Open any website
2. Open Chrome DevTools (F12 or right-click → Inspect)
3. Click the **"Network Clarity"** tab
4. Browse the page - network requests appear automatically

### Element Picker
1. Click the **🎯 Pick Element** button
2. Hover over any page element - resources will highlight
3. Click to select and view the request details
4. Press **Escape** to cancel

### Understanding Requests
- **Green rows**: First-party requests (from the same website)
- **Yellow rows**: Third-party requests (external services)
- **Red rows**: Known trackers

## 🛠️ Development

```bash
# Install dependencies
npm install

# Start development server (with hot reload)
npm run dev

# Build for production
npm run build

# Type check
npm run build
```

### Project Structure

```
src/
├── background/          # Service worker
├── components/          # React components
│   ├── JsonViewer.tsx   # JSON pretty-printer
│   └── CookieInspector.tsx  # Cookie analyzer
├── content/             # Content scripts
│   └── element-picker.ts    # Page element selection
├── devtools/            # DevTools panel
│   ├── Panel.tsx        # Main panel component
│   └── devtools.ts      # DevTools initialization
├── popup/               # Browser action popup
└── shared/              # Shared utilities
    ├── explanations.ts      # Status & type explanations
    ├── cookie-explanations.ts  # Cookie database
    └── utils.ts             # Helper functions
```

## 🔒 Privacy

Network Clarity operates **100% client-side**:
- ✅ No data leaves your browser
- ✅ No servers or APIs
- ✅ No analytics or tracking
- ✅ Data cleared when you close DevTools

## 📋 Requirements

- Chrome 88+ (Manifest V3)
- DevTools must be open to capture requests

## 🤝 Contributing

Contributions welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests

## 📄 License

MIT License - feel free to use and modify.

## 🙏 Acknowledgments

Built with:
- [React](https://react.dev)
- [Vite](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [@crxjs/vite-plugin](https://crxjs.dev/vite-plugin)
