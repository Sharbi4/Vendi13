/**
 * CORS Handler Utility
 * Manages Cross-Origin Resource Sharing policies for backend functions
 */

const ALLOWED_ORIGINS = [
  'https://vendibook.com',
  'https://www.vendibook.com',
  'http://localhost:3000',
  'http://localhost:5173'
];

/**
 * Check if origin is allowed
 */
function isOriginAllowed(origin) {
  if (!origin) return false;
  
  // Allow all subdomains of vendibook.com in production
  if (origin.endsWith('.vendibook.com')) return true;
  
  return ALLOWED_ORIGINS.includes(origin);
}

/**
 * Get CORS headers for response
 */
export function getCorsHeaders(req) {
  const origin = req.headers.get('origin');
  const allowedOrigin = isOriginAllowed(origin) ? origin : ALLOWED_ORIGINS[0];
  
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400', // 24 hours
  };
}

/**
 * Handle preflight OPTIONS request
 */
export function handleCorsPreFlight(req) {
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(req)
  });
}

/**
 * Add CORS headers to response
 */
export function addCorsHeaders(response, req) {
  const corsHeaders = getCorsHeaders(req);
  
  // Create new response with CORS headers
  const headers = new Headers(response.headers);
  Object.entries(corsHeaders).forEach(([key, value]) => {
    headers.set(key, value);
  });
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}