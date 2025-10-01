import { jest } from '@jest/globals';
import mongoose from 'mongoose';
import AddTenant from '../../src/models/AddTenant.js';

describe('AddTenant model', () => {
  it('requires user reference and has status enum', async () => {
    const doc = new AddTenant({}); // missing user
    await expect(doc.validate()).rejects.toBeInstanceOf(mongoose.Error.ValidationError);

    const u = new mongoose.Types.ObjectId();
    const t = new AddTenant({ user: u, status: 'paid' });
    await expect(t.validate()).resolves.toBeUndefined();

    const bad = new AddTenant({ user: u, status: 'weird' });
    await expect(bad.validate()).rejects.toBeInstanceOf(mongoose.Error.ValidationError);
  });
});
