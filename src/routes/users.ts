import { Hono } from 'hono';

const users = new Hono();

users.get('/', (c) => {
  return c.json([{ id: 1, name: 'John Doe' }]);
});

users.post('/', async (c) => {
  const body = await c.req.json();
  // TODO: save to database
  return c.json({ success: true, data: body }, 201);
});

export default users;
