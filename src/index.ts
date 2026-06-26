import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { swaggerUI } from '@hono/swagger-ui';

import userRoutes from './routes/users';
import nlRoutes from './routes/nl';
import thRoutes from './routes/th';

const app = new Hono();

// Global middleware
app.use('*', logger());
app.use('*', cors());

// Mount routes
app.route('/api/users', userRoutes);
app.route('/api/NL', nlRoutes);
app.route('/api/th', thRoutes);

// OpenAPI JSON spec
app.get('/doc', (c) => {
  return c.json({
    openapi: '3.0.0',
    info: {
      title: 'Hono API',
      version: '1.0.0',
      description: 'API documentation for the Hono Vercel application',
    },
    paths: {
      '/api/users': {
        get: {
          tags: ['Users'],
          summary: 'List users',
          responses: {
            '200': {
              description: 'Array of users',
              content: { 'application/json': { schema: { type: 'array', items: { type: 'object', properties: { id: { type: 'number' }, name: { type: 'string' } } } } } },
            },
          },
        },
        post: {
          tags: ['Users'],
          summary: 'Create a user',
          requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { name: { type: 'string' } } } } } },
          responses: { '201': { description: 'User created' } },
        },
      },
      '/api/NL/health': {
        get: {
          tags: ['NL'],
          summary: 'Health check for NL service',
          responses: {
            '200': {
              description: 'Service status',
              content: { 'application/json': { schema: { type: 'object', properties: { status: { type: 'string' }, service: { type: 'string' }, contracts_loaded: { type: 'number' } } } } },
            },
          },
        },
      },
      '/api/NL/lookup': {
        post: {
          tags: ['NL'],
          summary: 'Lookup a contract by phone, license plate, or contract number',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['lookup_key_type', 'lookup_key_value'],
                  properties: {
                    lookup_key_type: { type: 'string', enum: ['phone', 'license_plate', 'contract_number'], description: 'Type of lookup key' },
                    lookup_key_value: { type: 'string', description: 'Value to search for' },
                    call_id: { type: 'string', description: 'Optional call identifier' },
                  },
                },
              },
            },
          },
          responses: {
            '200': { description: 'Contract found or not found' },
            '400': { description: 'Missing required fields' },
          },
        },
      },
      '/api/NL/webhook/early-termination': {
        post: {
          tags: ['NL'],
          summary: 'Process an early termination request',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['call_id', 'contract_number', 'product', 'termination_end_date'],
                  properties: {
                    call_id: { type: 'string' },
                    contract_number: { type: 'string' },
                    license_plate: { type: 'string' },
                    product: { type: 'string', enum: ['financial_lease', 'operational_lease', 'private_lease'] },
                    termination_end_date: { type: 'string', format: 'date' },
                    expected_mileage: { type: 'number' },
                  },
                },
              },
            },
          },
          responses: {
            '200': { description: 'Termination result (success or manual_required)' },
            '400': { description: 'Missing required fields' },
          },
        },
      },
      '/api/th/Contracts/{contractId}': {
        get: {
          tags: ['TH'],
          summary: 'Get TH contract details',
          parameters: [
            {
              name: 'contractId',
              in: 'path',
              required: true,
              schema: { type: 'integer' },
              description: 'Contract identifier',
            },
            {
              name: 'FullDetails',
              in: 'query',
              required: false,
              schema: { type: 'boolean' },
              description: 'Include contractFull section when true',
            },
            {
              name: 'IsPreview',
              in: 'query',
              required: false,
              schema: { type: 'boolean' },
              description: 'Mark response data as draft when true',
            },
          ],
          responses: {
            '200': {
              description: 'TH contract payload',
            },
            '400': {
              description: 'Invalid contractId',
            },
          },
        },
      },
    },
  });
});

// Swagger UI at /swagger
app.get('/swagger', swaggerUI({ url: '/doc' }));

// Health check
app.get('/', (c) => c.json({ status: 'ok', message: 'Hono API on Vercel' }));

// 404 handler
app.notFound((c) => c.json({ error: 'Route not found' }, 404));

export default app;
