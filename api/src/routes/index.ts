import { Hono } from 'hono';
import type { Env, Variables } from '../types';
import store from './store';
import admin from './admin';
import { storeSubmissions, adminSubmissions } from './submissions';

const routes = new Hono<{ Bindings: Env; Variables: Variables }>();

// Mount store routes at /store
routes.route('/store', store);

// Mount admin routes at /admin
routes.route('/admin', admin);

// Mount submission routes
// - POST /store/submissions (public submission form)
routes.route('/store/submissions', storeSubmissions);
// - GET/POST /admin/submissions/* (admin review endpoints)
routes.route('/admin/submissions', adminSubmissions);

export default routes;
