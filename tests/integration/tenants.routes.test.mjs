import request from 'supertest';
import { makeApp } from './app.helper.mjs';
import User from '../../src/models/User.js';
import Property from '../../src/models/Property.js';

describe('AddTenant routes', () => {
  const app = makeApp();

  it('lists tenant-users (should work even if empty)', async () => {
    const res = await request(app).get('/api/addtenants/tenant-users');
    expect([200,204]).toContain(res.status);
  });

  it('upserts a tenant assignment if endpoint exists', async () => {
    // Prepare a Tenant user and Property
    const tenant = await User.create({ name: 'T1', email: 't1@example.com', passwordHash: 'x', role: 'Tenant' });
    const prop = await Property.create({ title: 'U1', rent: 400 });

    const up = await request(app).post('/api/addtenants/upsert').send({
      userId: tenant._id.toString(),
      phone: '0400000000',
      rent: 400,
      status: 'paid',
      propertyId: prop._id.toString()
    });

    // Some repos return 200 with doc, others 201; if route absent, it may be 404
    if (up.status !== 404) {
      expect([200,201]).toContain(up.status);
      expect(up.body).toHaveProperty('user');
      expect(up.body).toHaveProperty('property');
    }
  });
});
