import request from 'supertest';
import { makeApp } from './app.helper.mjs';
import Property from '../../src/models/Property.js';

describe('Property routes', () => {
  const app = makeApp();

  it('creates and lists properties', async () => {
    const create = await request(app).post('/api/properties').send({
      title: 'Unit 100', rent: 500, address: { line1: '1 Test St', city: 'Melbourne', state: 'VIC', postcode: '3000' }
    });
    expect([200,201]).toContain(create.status);

    const list = await request(app).get('/api/properties');
    expect(list.status).toBe(200);
    expect(Array.isArray(list.body)).toBe(true);
    // Ensure our item is present (by title match)
    expect(list.body.find(p => p.title === 'Unit 100')).toBeTruthy();
  });
});
