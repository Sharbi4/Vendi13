/**
 * Request Validation Utility
 * Validates request size, content type, and other security checks
 */

// Maximum request body size (in bytes)
const MAX_REQUEST_SIZE = {
  default: 1 * 1024 * 1024,      // 1 MB
  fileUpload: 10 * 1024 * 1024,   // 10 MB
  image: 10 * 1024 * 1024,        // 10 MB
  largePayload: 5 * 1024 * 1024   // 5 MB
};

/**
 * Validate request size
 */
export function validateRequestSize(req, maxSize = MAX_REQUEST_SIZE.default) {
  const contentLength = req.headers.get('content-length');
  
  if (!contentLength) {
    // No content-length header, will validate after parsing
    return { valid: true };
  }
  
  const size = parseInt(contentLength, 10);
  
  if (isNaN(size)) {
    return {
      valid: false,
      error: 'Invalid content-length header',
      status: 400
    };
  }
  
  if (size > maxSize) {
    const maxMB = (maxSize / (1024 * 1024)).toFixed(1);
    const requestMB = (size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `Request too large (${requestMB}MB). Maximum: ${maxMB}MB`,
      status: 413
    };
  }
  
  return { valid: true };
}

/**
 * Validate JSON body size after parsing
 */
export function validateParsedBodySize(body, maxSize = MAX_REQUEST_SIZE.default) {
  const bodyStr = JSON.stringify(body);
  const size = new TextEncoder().encode(bodyStr).length;
  
  if (size > maxSize) {
    const maxMB = (maxSize / (1024 * 1024)).toFixed(1);
    const requestMB = (size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `Request payload too large (${requestMB}MB). Maximum: ${maxMB}MB`,
      status: 413
    };
  }
  
  return { valid: true };
}

/**
 * Validate honeypot field (anti-bot)
 */
export function validateHoneypot(body) {
  // Check for honeypot field - should be empty
  if (body._honeypot && body._honeypot !== '') {
    return {
      valid: false,
      error: 'Invalid request',
      status: 400,
      isBot: true
    };
  }
  
  // Check for timing - bots fill forms too quickly
  if (body._timestamp) {
    const submitTime = Date.now();
    const formLoadTime = parseInt(body._timestamp, 10);
    const timeTaken = submitTime - formLoadTime;
    
    // If form submitted in less than 3 seconds, likely a bot
    if (timeTaken < 3000) {
      return {
        valid: false,
        error: 'Invalid request',
        status: 400,
        isBot: true
      };
    }
  }
  
  return { valid: true };
}

/**
 * Create error response for validation failures
 */
export function createValidationErrorResponse(validation) {
  return Response.json(
    { error: validation.error },
    { status: validation.status || 400 }
  );
}

/**
 * Comprehensive request validation
 */
export async function validateRequest(req, options = {}) {
  const {
    maxSize = MAX_REQUEST_SIZE.default,
    requireJson = true,
    checkHoneypot = false
  } = options;
  
  // Validate request size
  const sizeCheck = validateRequestSize(req, maxSize);
  if (!sizeCheck.valid) {
    return sizeCheck;
  }
  
  // Validate content type for JSON endpoints
  if (requireJson && req.method !== 'GET') {
    const contentType = req.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return {
        valid: false,
        error: 'Content-Type must be application/json',
        status: 415
      };
    }
  }
  
  // Parse body and validate size
  if (req.method !== 'GET' && requireJson) {
    try {
      const body = await req.json();
      
      // Validate parsed body size
      const bodySizeCheck = validateParsedBodySize(body, maxSize);
      if (!bodySizeCheck.valid) {
        return bodySizeCheck;
      }
      
      // Check honeypot if enabled
      if (checkHoneypot) {
        const honeypotCheck = validateHoneypot(body);
        if (!honeypotCheck.valid) {
          return honeypotCheck;
        }
      }
      
      return { valid: true, body };
    } catch (err) {
      return {
        valid: false,
        error: 'Invalid JSON body',
        status: 400
      };
    }
  }
  
  return { valid: true };
}