/**
 * PII (Personally Identifiable Information) Detector
 * 
 * Scans request/response content for common PII patterns:
 * - Email addresses
 * - Phone numbers
 * - Credit card numbers
 * - Social Security Numbers (US)
 * - IP addresses
 * - Names (from common fields)
 */

export type PIIType = 'email' | 'phone' | 'credit_card' | 'ssn' | 'ip_address' | 'name' | 'address';

export interface PIIMatch {
  type: PIIType;
  value: string;           // The matched value (partially masked for sensitive data)
  originalValue: string;   // The actual value found
  context: string;         // Surrounding context (field name if found)
  location: 'request' | 'response' | 'url';
}

export interface PIIDetectionResult {
  hasPII: boolean;
  matches: PIIMatch[];
  riskLevel: 'none' | 'low' | 'medium' | 'high';
  summary: string;
}

// Regex patterns for PII detection
const PII_PATTERNS: Record<PIIType, RegExp> = {
  email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
  phone: /(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}/g,
  credit_card: /\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|6(?:011|5[0-9]{2})[0-9]{12})\b/g,
  ssn: /\b\d{3}[-\s]?\d{2}[-\s]?\d{4}\b/g,
  ip_address: /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g,
  name: /(?:["']?(?:first_?name|last_?name|full_?name|user_?name|display_?name)["']?\s*[:=]\s*["']?)([a-zA-Z]{2,}(?:\s+[a-zA-Z]{2,})?)/gi,
  address: /(?:["']?(?:address|street|city|zip_?code|postal_?code)["']?\s*[:=]\s*["']?)([^"'\n,]{5,})/gi,
};

// Fields that commonly contain PII
const PII_FIELD_NAMES = [
  'email', 'mail', 'e-mail',
  'phone', 'telephone', 'mobile', 'cell',
  'name', 'firstname', 'first_name', 'lastname', 'last_name', 'fullname', 'full_name',
  'address', 'street', 'city', 'zip', 'postal',
  'ssn', 'social',
  'card', 'credit', 'cvv', 'ccv',
  'password', 'passwd', 'pwd',
  'dob', 'birthday', 'birth_date',
  'user', 'username', 'login',
];

/**
 * Mask sensitive data for display
 */
function maskValue(value: string, type: PIIType): string {
  switch (type) {
    case 'email':
      const [local, domain] = value.split('@');
      return `${local.substring(0, 2)}***@${domain}`;
    case 'phone':
      return value.replace(/\d(?=\d{4})/g, '*');
    case 'credit_card':
      return '**** **** **** ' + value.slice(-4);
    case 'ssn':
      return '***-**-' + value.slice(-4);
    case 'ip_address':
      return value; // IPs are less sensitive, show full
    default:
      if (value.length > 4) {
        return value.substring(0, 2) + '***' + value.substring(value.length - 2);
      }
      return '***';
  }
}

/**
 * Get human-readable name for PII type
 */
export function getPIITypeName(type: PIIType): string {
  switch (type) {
    case 'email': return 'Email Address';
    case 'phone': return 'Phone Number';
    case 'credit_card': return 'Credit Card';
    case 'ssn': return 'Social Security #';
    case 'ip_address': return 'IP Address';
    case 'name': return 'Personal Name';
    case 'address': return 'Physical Address';
    default: return 'Personal Data';
  }
}

/**
 * Get severity/risk for PII type
 */
function getPIIRisk(type: PIIType): number {
  switch (type) {
    case 'credit_card': return 10;
    case 'ssn': return 10;
    case 'email': return 5;
    case 'phone': return 5;
    case 'address': return 4;
    case 'name': return 2;
    case 'ip_address': return 1;
    default: return 1;
  }
}

/**
 * Detect PII in text content
 */
export function detectPII(
  content: string, 
  location: 'request' | 'response' | 'url'
): PIIMatch[] {
  const matches: PIIMatch[] = [];
  const seenValues = new Set<string>();
  
  // Check each PII pattern
  for (const [type, pattern] of Object.entries(PII_PATTERNS) as [PIIType, RegExp][]) {
    // Reset regex state
    pattern.lastIndex = 0;
    
    let match;
    while ((match = pattern.exec(content)) !== null) {
      // For name/address patterns, use the captured group
      const value = type === 'name' || type === 'address' 
        ? (match[1] || match[0]).trim()
        : match[0];
      
      // Skip duplicates
      if (seenValues.has(value.toLowerCase())) continue;
      seenValues.add(value.toLowerCase());
      
      // Skip obvious false positives
      if (type === 'ssn' && !isValidSSN(value)) continue;
      if (type === 'phone' && !isValidPhone(value)) continue;
      if (type === 'credit_card' && !isValidCreditCard(value)) continue;
      
      // Find context (nearby field name)
      const context = findContext(content, match.index);
      
      matches.push({
        type,
        value: maskValue(value, type),
        originalValue: value,
        context,
        location,
      });
    }
  }
  
  return matches;
}

/**
 * Find field name context around a match
 */
function findContext(content: string, matchIndex: number): string {
  // Look back up to 50 characters for a field name
  const lookback = content.substring(Math.max(0, matchIndex - 50), matchIndex);
  
  for (const fieldName of PII_FIELD_NAMES) {
    const regex = new RegExp(`["']?(${fieldName}[a-z_]*)["']?\\s*[:=]`, 'i');
    const fieldMatch = lookback.match(regex);
    if (fieldMatch) {
      return fieldMatch[1];
    }
  }
  
  return '';
}

/**
 * Validate SSN (basic check - 9 digits, not all same)
 */
function isValidSSN(value: string): boolean {
  const digits = value.replace(/[-\s]/g, '');
  if (digits.length !== 9) return false;
  // Not all same digit
  if (/^(\d)\1+$/.test(digits)) return false;
  // Not obviously fake
  if (digits.startsWith('000') || digits.startsWith('666') || digits.startsWith('9')) return false;
  return true;
}

/**
 * Validate phone number (basic check)
 */
function isValidPhone(value: string): boolean {
  const digits = value.replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 11;
}

/**
 * Validate credit card using Luhn algorithm
 */
function isValidCreditCard(value: string): boolean {
  const digits = value.replace(/\D/g, '');
  if (digits.length < 13 || digits.length > 19) return false;
  
  // Luhn algorithm
  let sum = 0;
  let isEven = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i], 10);
    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    isEven = !isEven;
  }
  return sum % 10 === 0;
}

/**
 * Analyze content and return full detection result
 */
export function analyzePII(
  requestBody: string | null,
  responseBody: string | null,
  url: string
): PIIDetectionResult {
  const allMatches: PIIMatch[] = [];
  
  // Check URL
  const urlMatches = detectPII(url, 'url');
  allMatches.push(...urlMatches);
  
  // Check request body
  if (requestBody) {
    const requestMatches = detectPII(requestBody, 'request');
    allMatches.push(...requestMatches);
  }
  
  // Check response body
  if (responseBody) {
    const responseMatches = detectPII(responseBody, 'response');
    allMatches.push(...responseMatches);
  }
  
  // Calculate risk level
  const totalRisk = allMatches.reduce((sum, match) => sum + getPIIRisk(match.type), 0);
  let riskLevel: PIIDetectionResult['riskLevel'] = 'none';
  if (totalRisk > 15) riskLevel = 'high';
  else if (totalRisk > 8) riskLevel = 'medium';
  else if (totalRisk > 0) riskLevel = 'low';
  
  // Generate summary
  let summary = '';
  if (allMatches.length === 0) {
    summary = 'No personal data detected';
  } else {
    const types = [...new Set(allMatches.map(m => getPIITypeName(m.type)))];
    summary = `Found: ${types.join(', ')}`;
  }
  
  return {
    hasPII: allMatches.length > 0,
    matches: allMatches,
    riskLevel,
    summary,
  };
}

/**
 * Get color class for risk level
 */
export function getRiskColor(riskLevel: PIIDetectionResult['riskLevel']): string {
  switch (riskLevel) {
    case 'high': return 'text-red-600 bg-red-100';
    case 'medium': return 'text-orange-600 bg-orange-100';
    case 'low': return 'text-yellow-600 bg-yellow-100';
    default: return 'text-green-600 bg-green-100';
  }
}
