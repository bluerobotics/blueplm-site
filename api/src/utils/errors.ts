import type { Context } from 'hono';
import type { Env, Variables, ApiResponse } from '../types';

/**
 * Custom API error class
 */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Not found error
 */
export function notFound(resource: string): ApiError {
  return new ApiError(404, `${resource} not found`, 'NOT_FOUND');
}

/**
 * Bad request error
 */
export function badRequest(message: string): ApiError {
  return new ApiError(400, message, 'BAD_REQUEST');
}

/**
 * Unauthorized error
 */
export function unauthorized(message = 'Authentication required'): ApiError {
  return new ApiError(401, message, 'UNAUTHORIZED');
}

/**
 * Forbidden error
 */
export function forbidden(message = 'Access denied'): ApiError {
  return new ApiError(403, message, 'FORBIDDEN');
}

/**
 * Conflict error (e.g., duplicate)
 */
export function conflict(message: string): ApiError {
  return new ApiError(409, message, 'CONFLICT');
}

/**
 * Rate limit exceeded error
 */
export function rateLimitExceeded(retryAfter: number): ApiError {
  const error = new ApiError(
    429,
    'Rate limit exceeded. Please try again later.',
    'RATE_LIMIT_EXCEEDED'
  );
  (error as ApiError & { retryAfter: number }).retryAfter = retryAfter;
  return error;
}

/**
 * Format error response
 */
export function errorResponse(
  c: Context<{ Bindings: Env; Variables: Variables }>,
  error: Error | ApiError
): Response {
  const requestId = c.get('requestId');

  if (error instanceof ApiError) {
    const response: ApiResponse = {
      success: false,
      error: error.message,
    };

    const headers: Record<string, string> = {};
    if ((error as ApiError & { retryAfter?: number }).retryAfter) {
      headers['Retry-After'] = String(
        (error as ApiError & { retryAfter: number }).retryAfter
      );
    }

    return c.json(response, error.status as 400 | 401 | 403 | 404 | 409 | 429, headers);
  }

  // Unexpected error
  console.error(`[${requestId}] Unexpected error:`, error);

  return c.json(
    {
      success: false,
      error: 'Internal server error',
    } as ApiResponse,
    500
  );
}
