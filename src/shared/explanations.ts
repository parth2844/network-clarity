/**
 * Human-readable explanations for network requests
 * Designed for non-technical users
 */

// HTTP Status Code Explanations
export interface StatusExplanation {
  summary: string;
  detail: string;
  isError: boolean;
  isWarning: boolean;
}

export const HTTP_STATUS_EXPLANATIONS: Record<number, StatusExplanation> = {
  // 1xx Informational
  100: {
    summary: 'Continue',
    detail: 'The server received the request headers and the client should proceed to send the request body.',
    isError: false,
    isWarning: false,
  },
  101: {
    summary: 'Switching Protocols',
    detail: 'The server is switching to a different protocol as requested by the client.',
    isError: false,
    isWarning: false,
  },

  // 2xx Success
  200: {
    summary: 'Success',
    detail: 'The request was successful. The data you see on the page came from this request.',
    isError: false,
    isWarning: false,
  },
  201: {
    summary: 'Created',
    detail: 'The request was successful and a new resource was created (e.g., a new account or post).',
    isError: false,
    isWarning: false,
  },
  202: {
    summary: 'Accepted',
    detail: 'The request was accepted but is still being processed in the background.',
    isError: false,
    isWarning: false,
  },
  204: {
    summary: 'No Content',
    detail: 'The request was successful but there\'s no data to return (common for delete operations).',
    isError: false,
    isWarning: false,
  },
  206: {
    summary: 'Partial Content',
    detail: 'Only part of the resource was returned (used for streaming videos or large file downloads).',
    isError: false,
    isWarning: false,
  },

  // 3xx Redirection
  301: {
    summary: 'Moved Permanently',
    detail: 'This page has permanently moved to a new URL. Your browser automatically followed the redirect.',
    isError: false,
    isWarning: true,
  },
  302: {
    summary: 'Temporary Redirect',
    detail: 'This page is temporarily at a different URL. Your browser automatically followed the redirect.',
    isError: false,
    isWarning: true,
  },
  303: {
    summary: 'See Other',
    detail: 'The server is redirecting you to a different page (often after form submission).',
    isError: false,
    isWarning: true,
  },
  304: {
    summary: 'Not Modified',
    detail: 'The resource hasn\'t changed since last visit. Your browser used a cached version (faster loading!).',
    isError: false,
    isWarning: false,
  },
  307: {
    summary: 'Temporary Redirect',
    detail: 'This page is temporarily at a different URL. Your browser automatically followed the redirect.',
    isError: false,
    isWarning: true,
  },
  308: {
    summary: 'Permanent Redirect',
    detail: 'This page has permanently moved to a new URL. Your browser automatically followed the redirect.',
    isError: false,
    isWarning: true,
  },

  // 4xx Client Errors
  400: {
    summary: 'Bad Request',
    detail: 'The server couldn\'t understand the request. This usually indicates a bug in the website.',
    isError: true,
    isWarning: false,
  },
  401: {
    summary: 'Unauthorized',
    detail: 'You need to log in to access this resource. Your credentials may have expired.',
    isError: true,
    isWarning: false,
  },
  403: {
    summary: 'Forbidden',
    detail: 'You don\'t have permission to access this resource, even if you\'re logged in.',
    isError: true,
    isWarning: false,
  },
  404: {
    summary: 'Not Found',
    detail: 'The requested page or file doesn\'t exist. It may have been moved or deleted.',
    isError: true,
    isWarning: false,
  },
  405: {
    summary: 'Method Not Allowed',
    detail: 'The server doesn\'t support this type of request for this resource.',
    isError: true,
    isWarning: false,
  },
  408: {
    summary: 'Request Timeout',
    detail: 'The request took too long and the server gave up waiting.',
    isError: true,
    isWarning: false,
  },
  409: {
    summary: 'Conflict',
    detail: 'The request conflicts with the current state (e.g., trying to create a duplicate).',
    isError: true,
    isWarning: false,
  },
  410: {
    summary: 'Gone',
    detail: 'This resource has been permanently deleted and won\'t be back.',
    isError: true,
    isWarning: false,
  },
  413: {
    summary: 'Payload Too Large',
    detail: 'The file or data you\'re trying to upload is too large for the server to accept.',
    isError: true,
    isWarning: false,
  },
  414: {
    summary: 'URL Too Long',
    detail: 'The URL is too long for the server to process.',
    isError: true,
    isWarning: false,
  },
  415: {
    summary: 'Unsupported Media Type',
    detail: 'The server doesn\'t support the file format you\'re trying to upload.',
    isError: true,
    isWarning: false,
  },
  422: {
    summary: 'Validation Error',
    detail: 'The server understood the request but the data provided was invalid.',
    isError: true,
    isWarning: false,
  },
  429: {
    summary: 'Too Many Requests',
    detail: 'You\'ve made too many requests too quickly. Wait a moment and try again.',
    isError: true,
    isWarning: false,
  },
  451: {
    summary: 'Unavailable For Legal Reasons',
    detail: 'This content is blocked due to legal restrictions (e.g., copyright or censorship).',
    isError: true,
    isWarning: false,
  },

  // 5xx Server Errors
  500: {
    summary: 'Server Error',
    detail: 'Something went wrong on the server. This is not your fault - the website has a problem.',
    isError: true,
    isWarning: false,
  },
  501: {
    summary: 'Not Implemented',
    detail: 'The server doesn\'t support this feature yet.',
    isError: true,
    isWarning: false,
  },
  502: {
    summary: 'Bad Gateway',
    detail: 'The server received an invalid response from another server it depends on.',
    isError: true,
    isWarning: false,
  },
  503: {
    summary: 'Service Unavailable',
    detail: 'The server is temporarily overloaded or down for maintenance. Try again later.',
    isError: true,
    isWarning: false,
  },
  504: {
    summary: 'Gateway Timeout',
    detail: 'The server took too long to respond. The website might be experiencing high traffic.',
    isError: true,
    isWarning: false,
  },
};

export function getStatusExplanation(status: number): StatusExplanation {
  return HTTP_STATUS_EXPLANATIONS[status] || {
    summary: `Status ${status}`,
    detail: 'Unknown status code.',
    isError: status >= 400,
    isWarning: status >= 300 && status < 400,
  };
}

// Request Type Explanations
export interface TypeExplanation {
  name: string;
  description: string;
  icon: string;
}

export const REQUEST_TYPE_EXPLANATIONS: Record<string, TypeExplanation> = {
  document: {
    name: 'Web Page',
    description: 'The main HTML page you\'re viewing.',
    icon: '📄',
  },
  stylesheet: {
    name: 'Styles',
    description: 'CSS files that control how the page looks (colors, layout, fonts).',
    icon: '🎨',
  },
  script: {
    name: 'Script',
    description: 'JavaScript code that makes the page interactive (buttons, forms, animations).',
    icon: '⚡',
  },
  image: {
    name: 'Image',
    description: 'Pictures and graphics displayed on the page.',
    icon: '🖼️',
  },
  font: {
    name: 'Font',
    description: 'Custom fonts used to display text on the page.',
    icon: '🔤',
  },
  xhr: {
    name: 'API Call',
    description: 'Data fetched in the background (like loading new posts without refreshing).',
    icon: '📡',
  },
  xmlhttprequest: {
    name: 'API Call',
    description: 'Data fetched in the background (like loading new posts without refreshing).',
    icon: '📡',
  },
  fetch: {
    name: 'API Call',
    description: 'Data fetched in the background using modern browser APIs.',
    icon: '📡',
  },
  media: {
    name: 'Media',
    description: 'Audio or video content like music players or embedded videos.',
    icon: '🎬',
  },
  websocket: {
    name: 'Live Connection',
    description: 'Real-time data connection (used for chat, live updates, gaming).',
    icon: '🔌',
  },
  manifest: {
    name: 'App Manifest',
    description: 'Configuration file for progressive web apps (PWA).',
    icon: '📋',
  },
  ping: {
    name: 'Analytics Ping',
    description: 'Small request to track page visits or clicks.',
    icon: '📊',
  },
  beacon: {
    name: 'Analytics Beacon',
    description: 'Background request to send analytics data.',
    icon: '📊',
  },
  prefetch: {
    name: 'Prefetch',
    description: 'Resource loaded ahead of time to speed up future page loads.',
    icon: '⏳',
  },
  other: {
    name: 'Other',
    description: 'Miscellaneous resource type.',
    icon: '📦',
  },
};

export function getTypeExplanation(type: string): TypeExplanation {
  return REQUEST_TYPE_EXPLANATIONS[type.toLowerCase()] || REQUEST_TYPE_EXPLANATIONS.other;
}

// Common Header Explanations
export interface HeaderExplanation {
  name: string;
  description: string;
  category: 'security' | 'caching' | 'content' | 'auth' | 'tracking' | 'other';
}

export const COMMON_HEADERS: Record<string, HeaderExplanation> = {
  // Request Headers
  'accept': {
    name: 'Accept',
    description: 'Tells the server what type of content the browser can handle.',
    category: 'content',
  },
  'accept-encoding': {
    name: 'Accept-Encoding',
    description: 'Tells the server what compression methods the browser supports (helps reduce data usage).',
    category: 'content',
  },
  'accept-language': {
    name: 'Accept-Language',
    description: 'Tells the server your preferred languages for content.',
    category: 'content',
  },
  'authorization': {
    name: 'Authorization',
    description: 'Contains your login credentials or access token to prove who you are.',
    category: 'auth',
  },
  'cookie': {
    name: 'Cookie',
    description: 'Small pieces of data the website previously stored in your browser (for login state, preferences, tracking).',
    category: 'tracking',
  },
  'user-agent': {
    name: 'User Agent',
    description: 'Identifies your browser and device to the server.',
    category: 'other',
  },
  'referer': {
    name: 'Referer',
    description: 'The page you came from. Websites use this for analytics and preventing hotlinking.',
    category: 'tracking',
  },
  'origin': {
    name: 'Origin',
    description: 'The website making this request. Used for security checks.',
    category: 'security',
  },

  // Response Headers
  'content-type': {
    name: 'Content-Type',
    description: 'The format of the data being sent (HTML, JSON, image, etc.).',
    category: 'content',
  },
  'content-length': {
    name: 'Content-Length',
    description: 'The size of the response data in bytes.',
    category: 'content',
  },
  'content-encoding': {
    name: 'Content-Encoding',
    description: 'How the data is compressed (gzip, br). Reduces download size.',
    category: 'content',
  },
  'cache-control': {
    name: 'Cache-Control',
    description: 'Instructions for how long your browser should keep a copy of this resource.',
    category: 'caching',
  },
  'expires': {
    name: 'Expires',
    description: 'When this cached content becomes outdated.',
    category: 'caching',
  },
  'etag': {
    name: 'ETag',
    description: 'A version identifier for the resource. Helps browser know when to re-download.',
    category: 'caching',
  },
  'last-modified': {
    name: 'Last-Modified',
    description: 'When this resource was last changed on the server.',
    category: 'caching',
  },
  'set-cookie': {
    name: 'Set-Cookie',
    description: 'The server is storing data in your browser (for login, preferences, or tracking).',
    category: 'tracking',
  },
  'access-control-allow-origin': {
    name: 'CORS Allow Origin',
    description: 'Which websites are allowed to access this resource. A security feature.',
    category: 'security',
  },
  'strict-transport-security': {
    name: 'HSTS',
    description: 'Forces your browser to always use secure HTTPS connections to this site.',
    category: 'security',
  },
  'content-security-policy': {
    name: 'Content Security Policy',
    description: 'Security rules that limit what resources the page can load (prevents attacks).',
    category: 'security',
  },
  'x-frame-options': {
    name: 'Frame Options',
    description: 'Controls whether this page can be embedded in other websites (prevents clickjacking).',
    category: 'security',
  },
  'x-content-type-options': {
    name: 'Content Type Options',
    description: 'Prevents browsers from guessing the content type (security feature).',
    category: 'security',
  },
  'x-xss-protection': {
    name: 'XSS Protection',
    description: 'Browser-level protection against cross-site scripting attacks.',
    category: 'security',
  },
  'location': {
    name: 'Location',
    description: 'The URL to redirect to (used with 3xx status codes).',
    category: 'other',
  },
  'server': {
    name: 'Server',
    description: 'The software running on the web server.',
    category: 'other',
  },
};

export function getHeaderExplanation(headerName: string): HeaderExplanation | null {
  return COMMON_HEADERS[headerName.toLowerCase()] || null;
}

// Category labels for headers
export const HEADER_CATEGORY_LABELS: Record<string, { label: string; color: string }> = {
  security: { label: '🔒 Security', color: 'text-blue-600' },
  caching: { label: '⚡ Caching', color: 'text-green-600' },
  content: { label: '📄 Content', color: 'text-gray-600' },
  auth: { label: '🔑 Authentication', color: 'text-purple-600' },
  tracking: { label: '👁️ Tracking/Cookies', color: 'text-orange-600' },
  other: { label: '📎 Other', color: 'text-gray-500' },
};
