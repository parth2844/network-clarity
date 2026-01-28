// Request types matching Chrome's webRequest API
export type RequestType =
  | 'main_frame'
  | 'sub_frame'
  | 'stylesheet'
  | 'script'
  | 'image'
  | 'font'
  | 'object'
  | 'xmlhttprequest'
  | 'ping'
  | 'csp_report'
  | 'media'
  | 'websocket'
  | 'other';

export interface Header {
  name: string;
  value: string;
}

export interface RequestTiming {
  startTime: number;
  endTime?: number;
  duration?: number;
}

export interface NetworkRequest {
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
  responseBody?: string;
  size?: number;
  mimeType?: string;
}

export interface TabStats {
  totalRequests: number;
  firstPartyCount: number;
  thirdPartyCount: number;
  trackerCount: number;
  trackerDomains: string[];
  uniqueDomains: string[];
}

export interface TabData {
  requests: NetworkRequest[];
  stats: TabStats;
  pageUrl: string;
  pageDomain: string;
}

// Message types for communication between components
export type MessageType =
  | 'GET_TAB_DATA'
  | 'CLEAR_TAB'
  | 'GET_CURRENT_TAB'
  | 'TAB_DATA_UPDATED';

export interface Message {
  type: MessageType;
  tabId?: number;
  payload?: unknown;
}

export interface GetTabDataResponse {
  success: boolean;
  data?: TabData;
  error?: string;
}

export interface GetCurrentTabResponse {
  tabId: number;
}
