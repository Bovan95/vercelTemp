import { Hono } from 'hono';

const app = new Hono();

app.get('/', (c) => c.json({ message: 'Hello from Vercel API!' }));

app.get('/users', (c) => {
  return c.json([{ id: 1, name: 'John' }]);
});

app.post('/users', async (c) => {
  const body = await c.req.json();
  return c.json({ success: true, data: body });
});

export default app;
