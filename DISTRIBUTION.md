# Distribution Guide for Network Clarity

This guide covers how to distribute the Network Clarity extension to users.

## Building for Distribution

Before distributing, create a production build:

```bash
npm run build
```

This creates the `dist/` folder with all extension files.

---

## Option 1: Personal Website (Self-Hosting)

### Preparing the Package

1. Build the extension:
   ```bash
   npm run build
   ```

2. Create a ZIP file:
   ```bash
   cd dist && zip -r ../network-clarity.zip . && cd ..
   ```

3. Host `network-clarity.zip` on your website

### Installation Instructions for Users

Share these instructions with your users:

1. **Download** `network-clarity.zip` from [your website URL]
2. **Extract** the ZIP file to a permanent location
   - Recommended: `~/Extensions/network-clarity/` or `C:\Extensions\network-clarity\`
   - ⚠️ **Important:** Choose a location you won't delete
3. **Open Chrome** and go to `chrome://extensions`
4. **Enable Developer Mode** (toggle in the top-right corner)
5. **Click "Load unpacked"**
6. **Select the extracted folder** (the one containing `manifest.json`)
7. Done! The extension icon will appear in your toolbar

### FAQ for Self-Hosted Installation

**Can I delete the downloaded ZIP file?**
> ✅ Yes, you can delete the ZIP after extraction.

**Can I delete the extracted folder?**
> ❌ No! Chrome loads the extension directly from this folder. If you delete it, the extension will break and you'll need to reinstall.

**Why do I see a "Developer mode extensions" warning?**
> Chrome shows this warning for extensions not installed from the Web Store. It's safe to dismiss.

**How do I update the extension?**
> Download the new version, extract to the same folder (replace files), then click the refresh icon on `chrome://extensions`.

### Limitations

- No automatic updates (users must manually download new versions)
- Chrome shows "Developer mode extensions" warning on startup
- Users must re-enable the extension after major Chrome updates

---

## Option 2: Chrome Web Store

Publishing to the Chrome Web Store removes all limitations of self-hosting and provides one-click installation.

### Requirements

- **$5 one-time** developer registration fee
- **Privacy policy** (required, can be hosted on GitHub Pages)
- **Screenshots** (at least 1-2 showing the extension in action)
- **Icons** (already included in `/public/icons/`)
- **Description** (440 characters max for summary)

### Steps to Publish

1. **Register as a developer**
   - Go to: https://chrome.google.com/webstore/devconsole
   - Pay the $5 registration fee

2. **Prepare your package**
   ```bash
   npm run build
   cd dist && zip -r ../network-clarity-webstore.zip . && cd ..
   ```

3. **Create listing assets**
   - Screenshots (1280x800 or 640x400 recommended)
   - Promotional images (optional)
   - Privacy policy URL

4. **Upload and submit**
   - Click "New Item" in the Developer Dashboard
   - Upload your ZIP file
   - Fill in all required fields
   - Submit for review

5. **Wait for approval**
   - Review typically takes 1-3 business days
   - You'll receive an email when approved

### Sample Privacy Policy

For a simple extension like Network Clarity that doesn't collect user data:

```
Privacy Policy for Network Clarity

Last updated: [Date]

Network Clarity does not collect, store, or transmit any personal data.

All network request data is processed locally in your browser and is never 
sent to any external servers. Data is only kept in memory while DevTools 
is open and is cleared when you close the panel or navigate to a new page.

The extension requires the following permissions:
- webRequest: To observe network requests made by web pages
- activeTab: To identify which website you're viewing
- tabs: To determine the current page's domain

No data leaves your browser. We have no servers and collect no analytics.

Contact: [your email]
```

### Benefits of Chrome Web Store

- ✅ One-click installation for users
- ✅ Automatic updates
- ✅ No developer mode warnings
- ✅ Easier discovery through search
- ✅ User reviews and ratings

---

## Recommended Approach

For **personal use or small audiences**: Self-hosting is free and works well.

For **wider distribution**: Chrome Web Store is worth the $5 fee for the better user experience.

---

## Quick Commands

```bash
# Build extension
npm run build

# Create ZIP for distribution
cd dist && zip -r ../network-clarity.zip . && cd ..

# Check ZIP contents
unzip -l network-clarity.zip
```
