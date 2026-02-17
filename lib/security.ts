import DOMPurify from 'isomorphic-dompurify';

// =====================================================
// CLIENT-SAFE SECURITY UTILITIES
// For server-only utilities, use ./security-server.ts
// =====================================================

// =====================================================
// HTML SANITIZATION
// =====================================================

/**
 * Sanitize HTML content to prevent XSS attacks
 * Use this for any user-generated HTML content
 */
export function sanitizeHTML(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
    ALLOW_DATA_ATTR: false,
  });
}

/**
 * Sanitize HTML but allow more tags (for admin content)
 */
export function sanitizeAdminHTML(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'p', 'br', 'hr',
      'b', 'i', 'em', 'strong', 'u', 's',
      'a', 'img',
      'ul', 'ol', 'li',
      'blockquote', 'pre', 'code',
      'div', 'span',
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'src', 'alt', 'width', 'height', 'class'],
    ALLOW_DATA_ATTR: false,
  });
}

/**
 * Strip all HTML tags from a string
 */
export function stripHTML(input: string): string {
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] });
}

// =====================================================
// RATE LIMITING
// =====================================================

interface RateLimitResult {
  success: boolean;
  remaining: number;
  reset: number;
}

// In-memory rate limiter for edge runtime
// In production, use Redis or the database function
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Client-side rate limiting check
 * Returns whether the request should be allowed
 */
export function checkRateLimit(
  identifier: string,
  endpoint: string,
  maxRequests: number = 10,
  windowSeconds: number = 60
): RateLimitResult {
  const key = `${identifier}:${endpoint}`;
  const now = Date.now();
  const windowMs = windowSeconds * 1000;

  const existing = rateLimitStore.get(key);

  if (!existing || now > existing.resetTime) {
    // New window
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + windowMs,
    });
    return {
      success: true,
      remaining: maxRequests - 1,
      reset: now + windowMs,
    };
  }

  if (existing.count >= maxRequests) {
    // Rate limited
    return {
      success: false,
      remaining: 0,
      reset: existing.resetTime,
    };
  }

  // Increment count
  existing.count += 1;
  rateLimitStore.set(key, existing);

  return {
    success: true,
    remaining: maxRequests - existing.count,
    reset: existing.resetTime,
  };
}

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Clean every minute

// =====================================================
// IP ADDRESS UTILITIES
// =====================================================

/**
 * Hash an IP address for privacy-preserving analytics
 */
export function hashIP(ip: string): string {
  // Simple hash for analytics - not cryptographically secure
  // but sufficient for anonymous tracking
  let hash = 0;
  for (let i = 0; i < ip.length; i++) {
    const char = ip.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16);
}

// =====================================================
// CSRF PROTECTION
// =====================================================

/**
 * Generate a CSRF token
 */
export function generateCSRFToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

// =====================================================
// SECURITY HEADERS
// =====================================================

export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

// =====================================================
// INPUT VALIDATION HELPERS
// =====================================================

/**
 * Check if a file type is allowed for upload
 */
export function isAllowedFileType(
  mimeType: string,
  allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/quicktime']
): boolean {
  return allowedTypes.includes(mimeType);
}

/**
 * Check if file size is within limits
 */
export function isAllowedFileSize(
  sizeInBytes: number,
  maxSizeMB: number = 50
): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return sizeInBytes <= maxSizeBytes;
}

/**
 * Validate and sanitize a URL
 */
export function sanitizeURL(url: string): string | null {
  try {
    const parsed = new URL(url);

    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return null;
    }

    // Remove any potentially dangerous characters
    return parsed.toString();
  } catch {
    return null;
  }
}

// =====================================================
// ERROR HANDLING
// =====================================================

/**
 * Create a safe error response that doesn't leak sensitive info
 */
export function createSafeErrorResponse(
  error: unknown,
  defaultMessage: string = 'An error occurred'
): { message: string; code: string } {
  // Never expose actual error details to clients
  console.error('Error:', error);

  return {
    message: defaultMessage,
    code: 'ERROR',
  };
}
