# Network Clarity

A Chrome extension that helps you understand website network activity in plain English. Perfect for non-technical users who want to know what's happening behind the scenes when they visit websites.

![Network Clarity](https://img.shields.io/badge/Chrome-Extension-green) ![Version](https://img.shields.io/badge/version-1.0.0-blue) ![License](https://img.shields.io/badge/license-MIT-gray)

## ✨ Features

### 🛡️ Privacy Score (A-F Grade)
Get an instant privacy assessment for any website.
- **One-glance grade**: A (excellent) to F (very poor)
- **Scoring factors**: Trackers, third-party ratio, domain count
- **Issues list**: Explains exactly why the score is low
- **Data flow summary**: "This page sends data to 15 different servers"

### 🔐 PII Detection
Automatically detect when your personal data appears in network traffic.
- **Detected types**: Email, phone, credit card, SSN, IP address, names, addresses
- **Masked display**: Shows `jo***@example.com` for security
- **Location tracking**: Shows if PII was sent (📤), received (📥), or in URL (🔗)
- **Risk levels**: None, Low, Medium, High
- **Luhn validation**: Credit card detection uses actual validation

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
- **Collapsible section** for cleaner view

### 📊 Request Analysis
Every network request explained in simple terms:
- **HTTP Status Codes**: "200 - Success" instead of just "200"
- **Request Types**: 📡 API Call, 🎨 Styles, ⚡ Script, 🖼️ Image
- **Third-party detection**: Know which requests go to external services
- **Tracker identification**: Spot known tracking scripts

### 📤 Request Body Viewer
See what data is being sent to servers:
- JSON payloads formatted with syntax highlighting
- Form data displayed in readable format
- MIME type indicator

### 📥 JSON Response Viewer
Pretty-printed JSON responses with:
- Syntax highlighting
- Collapsible objects and arrays
- Color-coded values (strings, numbers, booleans)

### ♿ Accessible Design
- Keyboard navigation for request list (Tab, Enter, Space)
- ARIA labels for screen readers
- Clear visual indicators for loading states

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

### Quick Start
1. Open any website
2. Open Chrome DevTools (F12 or right-click → Inspect)
3. Click the **"Network Clarity"** tab
4. Browse the page - network requests appear automatically

### Understanding the Interface

#### Toolbar
- **🗑️ Clear**: Clear all captured requests
- **Filter by URL**: Type to filter requests by URL or domain
- **🔍 Search responses**: Find text in response bodies
- **Type dropdown**: Filter by request type (API, Scripts, Images, etc.)

#### Request List (Left Panel)
- **Green rows**: First-party requests (from the same website)
- **Yellow rows**: Third-party requests (external services)
- **Red rows**: Known trackers
- **Purple highlight**: Matches response search

#### Request Details (Right Panel)
Click any request to see:
- **URL**: Full request URL
- **Method**: GET, POST, PUT, etc.
- **Status**: HTTP status with plain-English explanation
- **Type**: Request type with icon and description
- **Domain**: Server hostname
- **Classification**: First-party, Third-party, or Tracker badge
- **Timing**: How long the request took
- **Size**: Response size in KB/MB
- **🍪 Cookies**: Sent cookies and Set-Cookie headers with analysis
- **📤 Request Body**: POST/PUT payload (if any)
- **📥 Response Body**: JSON viewer or plain text

### Pro Tips
- Use **API Calls** filter to focus on data requests
- Search for a username to find the login/profile API
- Check cookies section to understand tracking on a site
- Collapse sections you don't need for a cleaner view

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
│   └── service-worker.ts
├── components/          # React components
│   ├── CollapsibleSection.tsx  # Reusable collapsible wrapper
│   ├── CookieInspector.tsx     # Cookie analyzer
│   └── JsonViewer.tsx          # JSON pretty-printer
├── devtools/            # DevTools panel
│   ├── Panel.tsx        # Main panel component
│   ├── devtools.ts      # DevTools initialization
│   └── panel.html       # Panel entry point
├── popup/               # Browser action popup
│   └── Popup.tsx        # Quick stats dashboard
└── shared/              # Shared utilities
    ├── cookie-explanations.ts  # Cookie database
    ├── explanations.ts         # Status & type explanations
    ├── tracker-list.ts         # Known tracker domains
    ├── types.ts                # TypeScript interfaces
    └── utils.ts                # Helper functions
```

## 🔒 Privacy

Network Clarity operates **100% client-side**:
- ✅ No data leaves your browser
- ✅ No servers or APIs
- ✅ No analytics or tracking
- ✅ Data cleared when you close DevTools

## 🆚 How This Differs From Chrome's Network Tab

| Feature | Chrome Network Tab | Network Clarity |
|---------|-------------------|-----------------|
| Privacy Score (A-F) | ❌ | ✅ |
| PII Detection | ❌ | ✅ |
| Cookie Risk Analysis | ❌ | ✅ |
| Tracker Detection | ❌ | ✅ |
| Plain-English Explanations | ❌ | ✅ |
| First/Third-Party Badges | ❌ | ✅ |
| Data Flow Summary | ❌ | ✅ |
| Request Blocking | ✅ | ❌ |
| HAR Export | ✅ | ❌ |
| Timing Waterfall | ✅ | ⚠️ Basic |

**Target audience**: Privacy-conscious users, junior developers, non-technical users who want to understand what websites are doing with their data.

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
