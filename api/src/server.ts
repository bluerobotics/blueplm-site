import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import { secureHeaders } from 'hono/secure-headers';
import type { Env, Variables, ApiResponse } from './types';
import { createSupabaseClient, createSupabaseAdmin, createSupabaseWithAuth } from './utils/supabase';
import { ApiError, errorResponse } from './utils/errors';
import routes from './routes';

// ============================================================================
// Create Hono app
// ============================================================================

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

// ============================================================================
// Global middleware
// ============================================================================

// Request ID for logging
app.use('*', async (c, next) => {
  const requestId = crypto.randomUUID().slice(0, 8);
  c.set('requestId', requestId);
  c.header('X-Request-Id', requestId);
  await next();
});

// CORS
app.use('*', cors({
  origin: (origin) => {
    // Allow requests from BluePLM app and marketplace
    const allowedOrigins = [
      'https://extensions.blueplm.io',
      'https://blueplm.io',
      'https://blueplm-site.pages.dev',  // Cloudflare Pages
      'http://localhost:5173',
      'http://localhost:3000',
      'tauri://localhost', // Tauri app
      'https://tauri.localhost',
    ];
    
    // Also allow BluePLM Electron app (custom protocol)
    if (origin?.startsWith('blueplm://')) {
      return origin;
    }
    
    return allowedOrigins.includes(origin || '') ? origin : allowedOrigins[0];
  },
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-API-Key', 'X-Reporter-Email'],
  exposeHeaders: ['X-Request-Id', 'X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
  maxAge: 86400,
  credentials: true,
}));

// Security headers
app.use('*', secureHeaders());

// Logger (only in development)
app.use('*', async (c, next) => {
  if (c.env.ENVIRONMENT === 'development') {
    return logger()(c, next);
  }
  await next();
});

// Pretty JSON in development
app.use('*', async (c, next) => {
  if (c.env.ENVIRONMENT === 'development') {
    return prettyJSON()(c, next);
  }
  await next();
});

// ============================================================================
// Authentication middleware
// ============================================================================

app.use('*', async (c, next) => {
  // Initialize Supabase clients
  c.set('supabase', createSupabaseClient(c.env));
  c.set('supabaseAdmin', createSupabaseAdmin(c.env));
  c.set('isAdmin', false);

  // Check for authentication
  const authHeader = c.req.header('Authorization');
  const apiKey = c.req.header('X-API-Key');

  // Admin API key check
  if (apiKey && apiKey === c.env.ADMIN_API_KEY) {
    c.set('isAdmin', true);
    c.set('publisherEmail', 'admin@bluerobotics.com');
    await next();
    return;
  }

  // JWT auth for publishers
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    
    try {
      const supabaseWithAuth = createSupabaseWithAuth(c.env, token);
      const { data: { user }, error } = await supabaseWithAuth.auth.getUser();
      
      if (!error && user?.email) {
        c.set('publisherEmail', user.email);
        c.set('supabase', supabaseWithAuth);

        // Check if user is admin (Blue Robotics email)
        if (user.email.endsWith('@bluerobotics.com')) {
          c.set('isAdmin', true);
        }
      }
    } catch {
      // Invalid token, continue as unauthenticated
    }
  }

  await next();
});

// ============================================================================
// Routes
// ============================================================================

// Health check
app.get('/', (c) => {
  return c.json({
    name: 'BluePLM Extension Store API',
    version: '1.0.0',
    status: 'healthy',
    environment: c.env.ENVIRONMENT,
  });
});

app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Mount all routes
app.route('/', routes);

// ============================================================================
// Error handling
// ============================================================================

// Not found handler
app.notFound((c) => {
  return c.json(
    {
      success: false,
      error: 'Not found',
    } as ApiResponse,
    404
  );
});

// Global error handler
app.onError((err, c) => {
  return errorResponse(c, err instanceof ApiError ? err : new Error(String(err)));
});

// ============================================================================
// Export for Cloudflare Workers
// ============================================================================

export default app;
