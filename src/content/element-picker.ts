/**
 * Element Picker Content Script
 * Allows users to click on page elements to find their source requests
 */

interface PickerMessage {
  type: 'PICKER_START' | 'PICKER_STOP' | 'PICKER_RESULT';
  resourceUrl?: string;
  elementType?: string;
  elementInfo?: {
    tagName: string;
    src?: string;
    href?: string;
    backgroundImage?: string;
  };
}

let isPickerActive = false;
let highlightOverlay: HTMLDivElement | null = null;
let lastHoveredElement: HTMLElement | null = null;

// Create highlight overlay
function createOverlay(): HTMLDivElement {
  const overlay = document.createElement('div');
  overlay.id = 'network-clarity-picker-overlay';
  overlay.style.cssText = `
    position: fixed;
    pointer-events: none;
    background: rgba(66, 133, 244, 0.3);
    border: 2px solid #4285f4;
    border-radius: 4px;
    z-index: 2147483647;
    transition: all 0.1s ease;
    display: none;
  `;
  document.body.appendChild(overlay);
  return overlay;
}

// Create picker tooltip
function createTooltip(): HTMLDivElement {
  const tooltip = document.createElement('div');
  tooltip.id = 'network-clarity-picker-tooltip';
  tooltip.style.cssText = `
    position: fixed;
    background: #333;
    color: white;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 12px;
    font-family: system-ui, -apple-system, sans-serif;
    z-index: 2147483647;
    pointer-events: none;
    max-width: 400px;
    word-break: break-all;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    display: none;
  `;
  document.body.appendChild(tooltip);
  return tooltip;
}

let tooltip: HTMLDivElement | null = null;

// Get resource URL from element
function getResourceUrl(element: HTMLElement): { url: string; type: string } | null {
  const tagName = element.tagName.toLowerCase();
  
  // Images
  if (tagName === 'img') {
    const src = element.getAttribute('src');
    if (src) return { url: resolveUrl(src), type: 'image' };
  }
  
  // Scripts
  if (tagName === 'script') {
    const src = element.getAttribute('src');
    if (src) return { url: resolveUrl(src), type: 'script' };
  }
  
  // Stylesheets
  if (tagName === 'link') {
    const rel = element.getAttribute('rel');
    const href = element.getAttribute('href');
    if (rel === 'stylesheet' && href) return { url: resolveUrl(href), type: 'stylesheet' };
    if (rel === 'icon' && href) return { url: resolveUrl(href), type: 'image' };
  }
  
  // Videos/Audio
  if (tagName === 'video' || tagName === 'audio') {
    const src = element.getAttribute('src');
    if (src) return { url: resolveUrl(src), type: 'media' };
  }
  
  // Source elements (inside video/audio)
  if (tagName === 'source') {
    const src = element.getAttribute('src');
    if (src) return { url: resolveUrl(src), type: 'media' };
  }
  
  // Iframes
  if (tagName === 'iframe') {
    const src = element.getAttribute('src');
    if (src) return { url: resolveUrl(src), type: 'document' };
  }
  
  // Background images via inline style
  const bgImage = window.getComputedStyle(element).backgroundImage;
  if (bgImage && bgImage !== 'none') {
    const match = bgImage.match(/url\(["']?([^"')]+)["']?\)/);
    if (match && match[1]) {
      return { url: resolveUrl(match[1]), type: 'image' };
    }
  }
  
  // Object/embed
  if (tagName === 'object' || tagName === 'embed') {
    const data = element.getAttribute('data') || element.getAttribute('src');
    if (data) return { url: resolveUrl(data), type: 'other' };
  }
  
  return null;
}

// Resolve relative URLs
function resolveUrl(url: string): string {
  try {
    return new URL(url, window.location.href).href;
  } catch {
    return url;
  }
}

// Handle mouse move
function handleMouseMove(e: MouseEvent) {
  if (!isPickerActive) return;
  
  const element = e.target as HTMLElement;
  if (element === lastHoveredElement) return;
  
  lastHoveredElement = element;
  
  if (!highlightOverlay) {
    highlightOverlay = createOverlay();
  }
  if (!tooltip) {
    tooltip = createTooltip();
  }
  
  const resource = getResourceUrl(element);
  
  if (resource) {
    // Show overlay
    const rect = element.getBoundingClientRect();
    highlightOverlay.style.display = 'block';
    highlightOverlay.style.top = `${rect.top}px`;
    highlightOverlay.style.left = `${rect.left}px`;
    highlightOverlay.style.width = `${rect.width}px`;
    highlightOverlay.style.height = `${rect.height}px`;
    
    // Show tooltip
    tooltip.textContent = `${resource.type.toUpperCase()}: ${resource.url.length > 100 ? resource.url.substring(0, 100) + '...' : resource.url}`;
    tooltip.style.display = 'block';
    
    // Position tooltip
    let tooltipTop = rect.bottom + 8;
    let tooltipLeft = rect.left;
    
    // Adjust if offscreen
    if (tooltipTop + 50 > window.innerHeight) {
      tooltipTop = rect.top - 40;
    }
    if (tooltipLeft + 300 > window.innerWidth) {
      tooltipLeft = window.innerWidth - 320;
    }
    
    tooltip.style.top = `${tooltipTop}px`;
    tooltip.style.left = `${tooltipLeft}px`;
  } else {
    highlightOverlay.style.display = 'none';
    tooltip.style.display = 'none';
  }
}

// Handle click
function handleClick(e: MouseEvent) {
  if (!isPickerActive) return;
  
  e.preventDefault();
  e.stopPropagation();
  
  const element = e.target as HTMLElement;
  const resource = getResourceUrl(element);
  
  if (resource) {
    // Send result to DevTools
    chrome.runtime.sendMessage({
      type: 'PICKER_RESULT',
      resourceUrl: resource.url,
      elementType: resource.type,
      elementInfo: {
        tagName: element.tagName.toLowerCase(),
        src: element.getAttribute('src'),
        href: element.getAttribute('href'),
      }
    });
  }
  
  // Stop picker
  stopPicker();
}

// Handle key press (Escape to cancel)
function handleKeyDown(e: KeyboardEvent) {
  if (e.key === 'Escape' && isPickerActive) {
    stopPicker();
  }
}

// Start picker mode
function startPicker() {
  isPickerActive = true;
  document.body.style.cursor = 'crosshair';
  
  document.addEventListener('mousemove', handleMouseMove, true);
  document.addEventListener('click', handleClick, true);
  document.addEventListener('keydown', handleKeyDown, true);
  
  // Create overlay if needed
  if (!highlightOverlay) {
    highlightOverlay = createOverlay();
  }
  if (!tooltip) {
    tooltip = createTooltip();
  }
}

// Stop picker mode
function stopPicker() {
  isPickerActive = false;
  document.body.style.cursor = '';
  lastHoveredElement = null;
  
  document.removeEventListener('mousemove', handleMouseMove, true);
  document.removeEventListener('click', handleClick, true);
  document.removeEventListener('keydown', handleKeyDown, true);
  
  if (highlightOverlay) {
    highlightOverlay.style.display = 'none';
  }
  if (tooltip) {
    tooltip.style.display = 'none';
  }
  
  // Notify that picker stopped
  chrome.runtime.sendMessage({ type: 'PICKER_STOPPED' });
}

// Listen for messages from DevTools
chrome.runtime.onMessage.addListener((message: PickerMessage, _sender, sendResponse) => {
  if (message.type === 'PICKER_START') {
    startPicker();
    sendResponse({ success: true });
  } else if (message.type === 'PICKER_STOP') {
    stopPicker();
    sendResponse({ success: true });
  }
  return true;
});

// Expose for debugging
(window as unknown as { __networkClarityPicker: { start: () => void; stop: () => void } }).__networkClarityPicker = {
  start: startPicker,
  stop: stopPicker
};
