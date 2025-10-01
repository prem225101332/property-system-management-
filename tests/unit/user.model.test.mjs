import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../../src/models/User.js';

describe('User model', () => {
  it('enforces role enum Admin/Tenant', async () => {
    const doc = new User({ name: 'A', email: 'a@example.com', passwordHash: 'x', role: 'Admin' });
    await expect(doc.validate()).resolves.toBeUndefined();

    const bad = new User({ name: 'B', email: 'b@example.com', passwordHash: 'x', role: 'Superuser' });
    await expect(bad.validate()).rejects.toBeInstanceOf(mongoose.Error.ValidationError);
  });

  it('comparePassword uses bcrypt.compare on passwordHash', async () => {
    const hash = await bcrypt.hash('secret', 10);
    const user = await User.create({ name: 'C', email: 'c@example.com', passwordHash: hash, role: 'Tenant' });
    await expect(user.comparePassword('secret')).resolves.toBe(true);
    await expect(user.comparePassword('nope')).resolves.toBe(false);
  });
});
