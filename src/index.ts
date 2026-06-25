import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';

import userRoutes from './routes/users';
import nlRoutes from './routes/nl';

const app = new Hono();

// Global middleware
app.use('*', logger());
app.use('*', cors());

// Mount routes
app.route('/api/users', userRoutes);
app.route('/api/NL', nlRoutes);

// Health check
app.get('/', (c) => c.json({ status: 'ok', message: 'Hono API on Vercel' }));

// 404 handler
app.notFound((c) => c.json({ error: 'Route not found' }, 404));

export default app;
