import { headers } from 'next/headers';

// =====================================================
// SERVER-ONLY SECURITY UTILITIES
// This file should only be imported in Server Components,
// API routes, and Server Actions
// =====================================================

/**
 * Get the client's IP address from request headers
 * Handles various proxy configurations
 */
export async function getClientIP(): Promise<string> {
  const headersList = await headers();

  // Check various headers in order of preference
  const forwardedFor = headersList.get('x-forwarded-for');
  if (forwardedFor) {
    // Take the first IP if there are multiple
    return forwardedFor.split(',')[0].trim();
  }

  const realIP = headersList.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  const cfConnectingIP = headersList.get('cf-connecting-ip');
  if (cfConnectingIP) {
    return cfConnectingIP;
  }

  // Default fallback
  return '127.0.0.1';
}

/**
 * Verify origin header matches expected origins
 */
export async function verifyOrigin(allowedOrigins: string[]): Promise<boolean> {
  const headersList = await headers();
  const origin = headersList.get('origin');
  const referer = headersList.get('referer');

  if (!origin && !referer) {
    // Allow requests without origin (like from same origin)
    return true;
  }

  const checkOrigin = origin || (referer ? new URL(referer).origin : '');

  return allowedOrigins.some((allowed) => {
    if (allowed === '*') return true;
    return checkOrigin === allowed || checkOrigin.endsWith(allowed);
  });
}
