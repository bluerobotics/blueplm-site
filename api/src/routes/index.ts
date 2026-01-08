import { Hono } from 'hono';
import type { Env, Variables } from '../types';
import store from './store';
import admin from './admin';

const routes = new Hono<{ Bindings: Env; Variables: Variables }>();

// Mount store routes at /store
routes.route('/store', store);

// Mount admin routes at /admin
routes.route('/admin', admin);

export default routes;
