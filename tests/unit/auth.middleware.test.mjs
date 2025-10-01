import { jest } from '@jest/globals';
import jwt from 'jsonwebtoken';
import { authRequired, requireRole } from '../../src/middleware/auth.js';

function mockRes() {
  const res = {};
  res.statusCode = 200;
  res.body = null;
  res.status = (c) => { res.statusCode = c; return res; };
  res.json = (b) => { res.body = b; return res; };
  return res;
}

describe('auth middleware', () => {
  const secret = process.env.JWT_SECRET || 'test-secret';

  it('authRequired rejects when absent/invalid', () => {
    const req = { headers: {} };
    const res = mockRes();
    const next = jest.fn();
    authRequired(req, res, next);
    expect(res.statusCode).toBe(401);

    const req2 = { headers: { authorization: 'Bearer bad' } };
    const res2 = mockRes();
    authRequired(req2, res2, next);
    expect(res2.statusCode).toBe(401);
  });

  it('authRequired sets req.user on success', () => {
    const token = jwt.sign({ sub: '123', role: 'Admin', email: 'a@b.com' }, secret, { expiresIn: '1h' });
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = mockRes();
    const next = jest.fn();
    authRequired(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.user).toMatchObject({ id: '123', role: 'Admin', email: 'a@b.com' });
  });

  it('requireRole enforces role membership', () => {
    const mid = requireRole('Admin');
    const res = mockRes();
    const next = jest.fn();
    mid({ user: { role: 'Tenant' } }, res, next);
    expect(res.statusCode).toBe(403);

    const res2 = mockRes();
    const next2 = jest.fn();
    mid({ user: { role: 'Admin' } }, res2, next2);
    expect(next2).toHaveBeenCalled();
  });
});
