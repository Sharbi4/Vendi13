/**
 * Rate Limiter Utility
 * Protects backend functions from abuse and spam
 */

class RateLimiter {
  constructor() {
    this.requests = new Map();
    // Clean up old entries every 10 minutes
    setInterval(() => this.cleanup(), 10 * 60 * 1000);
  }

  /**
   * Check if request should be allowed
   * @param {string} identifier - User email or IP address
   * @param {object} options - Rate limit configuration
   * @param {number} options.maxRequests - Maximum requests allowed
   * @param {number} options.windowMs - Time window in milliseconds
   * @returns {object} - { allowed: boolean, remaining: number, resetTime: number }
   */
  checkLimit(identifier, { maxRequests = 100, windowMs = 60000 } = {}) {
    const now = Date.now();
    const key = identifier;

    if (!this.requests.has(key)) {
      this.requests.set(key, []);
    }

    const userRequests = this.requests.get(key);
    
    // Remove expired requests
    const validRequests = userRequests.filter(timestamp => now - timestamp < windowMs);
    this.requests.set(key, validRequests);

    // Check if limit exceeded
    if (validRequests.length >= maxRequests) {
      const oldestRequest = validRequests[0];
      const resetTime = oldestRequest + windowMs;
      
      return {
        allowed: false,
        remaining: 0,
        resetTime,
        retryAfter: Math.ceil((resetTime - now) / 1000)
      };
    }

    // Add current request
    validRequests.push(now);
    this.requests.set(key, validRequests);

    return {
      allowed: true,
      remaining: maxRequests - validRequests.length,
      resetTime: now + windowMs,
      retryAfter: null
    };
  }

  /**
   * Clean up old entries to prevent memory leaks
   */
  cleanup() {
    const now = Date.now();
    const maxAge = 60 * 60 * 1000; // 1 hour

    for (const [key, requests] of this.requests.entries()) {
      const validRequests = requests.filter(timestamp => now - timestamp < maxAge);
      if (validRequests.length === 0) {
        this.requests.delete(key);
      } else {
        this.requests.set(key, validRequests);
      }
    }
  }

  /**
   * Reset rate limit for a specific identifier (for testing or admin override)
   */
  reset(identifier) {
    this.requests.delete(identifier);
  }
}

// Singleton instance
const rateLimiter = new RateLimiter();

/**
 * Rate limit middleware for backend functions
 * @param {Request} req - Incoming request
 * @param {object} base44 - Base44 SDK instance
 * @param {object} options - Rate limit configuration
 */
export async function checkRateLimit(req, base44, options = {}) {
  const {
    maxRequests = 100,
    windowMs = 60000,
    skipAuthenticatedUsers = false,
    authenticatedMaxRequests = 200
  } = options;

  let identifier;
  let limits = { maxRequests, windowMs };

  try {
    // Try to get authenticated user
    const user = await base44.auth.me();
    if (user) {
      identifier = user.email;
      
      // Authenticated users get higher limits
      if (skipAuthenticatedUsers) {
        return { allowed: true, remaining: 999, resetTime: null };
      }
      limits.maxRequests = authenticatedMaxRequests;
    }
  } catch (err) {
    // Not authenticated, use IP address
  }

  // Fall back to IP address for unauthenticated requests
  if (!identifier) {
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : 
               req.headers.get('x-real-ip') || 'unknown';
    identifier = `ip:${ip}`;
  }

  return rateLimiter.checkLimit(identifier, limits);
}

/**
 * Helper to create rate limit response
 */
export function createRateLimitResponse(result) {
  return Response.json(
    {
      error: 'Too many requests',
      message: 'Rate limit exceeded. Please try again later.',
      retryAfter: result.retryAfter
    },
    {
      status: 429,
      headers: {
        'Retry-After': result.retryAfter.toString(),
        'X-RateLimit-Limit': '100',
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': new Date(result.resetTime).toISOString()
      }
    }
  );
}

export default rateLimiter;