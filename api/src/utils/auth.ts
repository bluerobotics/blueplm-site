import type { Context } from 'hono';
import type { Env, Variables, AdminUser } from '../types';
import { ApiError } from './errors';

// ============================================================================
// Constants
// ============================================================================

/**
 * Email domain allowed for admin access
 */
export const ADMIN_EMAIL_DOMAIN = '@bluerobotics.com';

// ============================================================================
// Auth helpers
// ============================================================================

/**
 * Check if an email address belongs to a Blue Robotics admin
 */
export function isAdminEmail(email: string | undefined | null): boolean {
  if (!email) return false;
  return email.toLowerCase().endsWith(ADMIN_EMAIL_DOMAIN);
}

/**
 * Get the authenticated user's email from the request context
 */
export function getAuthenticatedEmail(
  c: Context<{ Bindings: Env; Variables: Variables }>
): string | undefined {
  return c.get('publisherEmail');
}

/**
 * Check if the current request is from an authenticated admin
 */
export function isAuthenticatedAdmin(
  c: Context<{ Bindings: Env; Variables: Variables }>
): boolean {
  return c.get('isAdmin') === true;
}

/**
 * Get the authenticated admin user details, or null if not admin
 */
export function getAdminUser(
  c: Context<{ Bindings: Env; Variables: Variables }>
): AdminUser | null {
  const email = getAuthenticatedEmail(c);
  const isAdmin = isAuthenticatedAdmin(c);

  if (!isAdmin || !email) {
    return null;
  }

  return {
    email,
    isAdmin: true,
  };
}

/**
 * Require admin authentication - throws ApiError if not authenticated as admin
 */
export function requireAdmin(
  c: Context<{ Bindings: Env; Variables: Variables }>
): AdminUser {
  const admin = getAdminUser(c);

  if (!admin) {
    throw new ApiError(
      401,
      'Unauthorized: Admin access required. Only @bluerobotics.com accounts can access this resource.'
    );
  }

  return admin;
}

/**
 * Require any authentication - throws ApiError if not authenticated
 */
export function requireAuth(
  c: Context<{ Bindings: Env; Variables: Variables }>
): string {
  const email = getAuthenticatedEmail(c);

  if (!email) {
    throw new ApiError(
      401,
      'Unauthorized: Authentication required. Please sign in with Google.'
    );
  }

  return email;
}

/**
 * Extract the username part of an email address
 */
export function getEmailUsername(email: string): string {
  const atIndex = email.indexOf('@');
  return atIndex > 0 ? email.slice(0, atIndex) : email;
}

/**
 * Get a display name from an email address
 * e.g., "john.doe@bluerobotics.com" -> "John Doe"
 */
export function getDisplayNameFromEmail(email: string): string {
  const username = getEmailUsername(email);
  return username
    .split(/[._-]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}
