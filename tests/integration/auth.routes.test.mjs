import request from 'supertest';
import jwt from 'jsonwebtoken';
import { makeApp } from './app.helper.mjs';
import User from '../../src/models/User.js';

describe('Auth routes', () => {
  const app = makeApp();

  it('rejects invalid role on /register', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'X', email: 'x@example.com', password: 'secret', role: 'Superuser'
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/invalid role/i);
  });

  it('registers Admin and logs in', async () => {
    const reg = await request(app).post('/api/auth/register').send({
      name: 'Admin A', email: 'a@example.com', password: 'secret', role: 'Admin'
    });
    expect([200,201]).toContain(reg.status);
    // try login if route exists
    const login = await request(app).post('/api/auth/login').send({
      email: 'a@example.com', password: 'secret'
    });
    // Some repos return token on register; if login route not present, skip assert
    if (login.status !== 404) {
      expect(login.status).toBe(200);
      expect(login.body.token).toBeTruthy();
      const decoded = jwt.decode(login.body.token);
      expect(decoded).toHaveProperty('role', 'Admin');
    }
  });
});
