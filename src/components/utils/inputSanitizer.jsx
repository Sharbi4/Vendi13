/**
 * Input Sanitization Utility
 * Prevents XSS attacks by sanitizing user inputs
 */

/**
 * Sanitize HTML to prevent XSS attacks
 * Removes dangerous tags and attributes
 */
export function sanitizeHTML(input) {
  if (!input) return '';
  
  // Convert to string
  const str = String(input);
  
  // Remove script tags and their content
  let sanitized = str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove event handlers (onclick, onerror, etc.)
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*[^\s>]*/gi, '');
  
  // Remove javascript: protocol
  sanitized = sanitized.replace(/javascript:/gi, '');
  
  // Remove data: protocol (can be used for XSS)
  sanitized = sanitized.replace(/data:text\/html/gi, '');
  
  // Remove iframe tags
  sanitized = sanitized.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
  
  // Remove object and embed tags
  sanitized = sanitized.replace(/<(object|embed)[^>]*>/gi, '');
  
  return sanitized.trim();
}

/**
 * Sanitize plain text input
 * More strict - only allows safe characters
 */
export function sanitizeText(input, options = {}) {
  if (!input) return '';
  
  const {
    allowNewlines = true,
    maxLength = 10000,
    allowSpecialChars = true
  } = options;
  
  let sanitized = String(input);
  
  // Trim whitespace
  sanitized = sanitized.trim();
  
  // Limit length
  if (maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }
  
  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '');
  
  // Handle newlines
  if (!allowNewlines) {
    sanitized = sanitized.replace(/[\r\n]/g, ' ');
  }
  
  // Remove potentially dangerous characters if not allowed
  if (!allowSpecialChars) {
    sanitized = sanitized.replace(/[<>]/g, '');
  }
  
  return sanitized;
}

/**
 * Sanitize email address
 */
export function sanitizeEmail(email) {
  if (!email) return '';
  
  const sanitized = String(email).trim().toLowerCase();
  
  // Basic email validation regex
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
  if (!emailRegex.test(sanitized)) {
    return '';
  }
  
  return sanitized;
}

/**
 * Sanitize phone number
 */
export function sanitizePhone(phone) {
  if (!phone) return '';
  
  // Remove all non-digit characters except + at start
  let sanitized = String(phone).trim();
  sanitized = sanitized.replace(/[^\d+]/g, '');
  
  // Ensure + is only at start
  if (sanitized.includes('+')) {
    const parts = sanitized.split('+');
    sanitized = '+' + parts.join('');
  }
  
  return sanitized;
}

/**
 * Sanitize URL
 */
export function sanitizeURL(url) {
  if (!url) return '';
  
  const sanitized = String(url).trim();
  
  // Only allow http/https protocols
  try {
    const parsed = new URL(sanitized);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return '';
    }
    return parsed.href;
  } catch {
    return '';
  }
}

/**
 * Sanitize number input
 */
export function sanitizeNumber(input, options = {}) {
  const {
    min = null,
    max = null,
    decimals = 2,
    allowNegative = false
  } = options;
  
  if (input === null || input === undefined || input === '') return null;
  
  let num = parseFloat(input);
  
  if (isNaN(num)) return null;
  
  // Handle negative numbers
  if (!allowNegative && num < 0) {
    num = 0;
  }
  
  // Apply min/max
  if (min !== null && num < min) num = min;
  if (max !== null && num > max) num = max;
  
  // Round to specified decimals
  if (decimals !== null) {
    num = Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
  }
  
  return num;
}

/**
 * Sanitize form data object
 */
export function sanitizeFormData(formData) {
  const sanitized = {};
  
  for (const [key, value] of Object.entries(formData)) {
    if (typeof value === 'string') {
      // Check if it's an email field
      if (key.toLowerCase().includes('email')) {
        sanitized[key] = sanitizeEmail(value);
      }
      // Check if it's a phone field
      else if (key.toLowerCase().includes('phone')) {
        sanitized[key] = sanitizePhone(value);
      }
      // Check if it's a URL field
      else if (key.toLowerCase().includes('url') || key.toLowerCase().includes('link')) {
        sanitized[key] = sanitizeURL(value);
      }
      // Default to HTML sanitization
      else {
        sanitized[key] = sanitizeHTML(value);
      }
    }
    else if (typeof value === 'number') {
      sanitized[key] = sanitizeNumber(value);
    }
    else if (Array.isArray(value)) {
      sanitized[key] = value.map(item => 
        typeof item === 'string' ? sanitizeHTML(item) : item
      );
    }
    else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}