import mongoose from 'mongoose';
import Property from '../../src/models/Property.js';

describe('Property model', () => {
  it('requires title and rent and defaults status', async () => {
    const p = new Property({ title: 'Unit 1', rent: 450 });
    await expect(p.validate()).resolves.toBeUndefined();
    expect(p.status).toBe('AVAILABLE');
  });

  it('rejects invalid status', async () => {
    const p = new Property({ title: 'X', rent: 1, status: 'BROKEN' });
    await expect(p.validate()).rejects.toBeInstanceOf(mongoose.Error.ValidationError);
  });
});
