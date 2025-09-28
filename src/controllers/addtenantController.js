import AddTenant from '../models/AddTenant.js';
import Property from '../models/Property.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

export async function listTenantUsers(req, res) {
  try {
    const users = await User.find({ role: 'Tenant' }).select('name email role');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch tenant users', error: err.message });
  }
}

export async function listAddTenants(req, res) {
  try {
    const users = await User.find({ role: 'Tenant' }).select('name email');
    const assigns = await AddTenant.find().populate('property', 'title name address').populate('user', 'name email');
    const map = new Map(assigns.map(a => [String(a.user?._id || ''), a]));
    const out = users.map(u => {
      const a = map.get(String(u._id));
      return {
        user: { _id: u._id, name: u.name, email: u.email },
        _id: a?._id || null,
        phone: a?.phone || '',
        rent: a?.rent ?? 0,
        status: a?.status || 'paid',
        property: a?.property || null
      };
    });
    res.json(out);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch tenants', error: err.message });
  }
}

export async function getAddTenant(req, res) {
  try {
    const id = req.params.id;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: 'Invalid id' });
    const doc = await AddTenant.findById(id).populate('property', 'title name address').populate('user', 'name email');
    if (!doc) return res.status(404).json({ message: 'Assignment not found' });
    res.json(doc);
  } catch (err) {
    res.status(400).json({ message: 'Invalid id', error: err.message });
  }
}

export async function upsertAddTenant(req, res) {
  try {
    const { userId, phone, rent, status = 'paid', propertyId } = req.body;
    if (!userId) return res.status(400).json({ message: 'userId is required' });
    const user = await User.findOne({ _id: userId, role: 'Tenant' });
    if (!user) return res.status(404).json({ message: 'Tenant user not found' });

    let property = null;
    if (propertyId) {
      property = await Property.findById(propertyId);
      if (!property) return res.status(404).json({ message: 'Property not found' });
    }

    const update = {
      user: userId,
      phone: phone ?? '',
      rent: rent ?? 0,
      status: status || 'paid',
      property: property ? property._id : undefined
    };

    const doc = await AddTenant.findOneAndUpdate(
      { user: userId },
      update,
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).populate('property', 'title name address').populate('user', 'name email');

    res.status(200).json(doc);
  } catch (err) {
    res.status(500).json({ message: 'Failed to save assignment', error: err.message });
  }
}

export async function updateAddTenant(req, res) {
  try {
    const { phone, rent, status, propertyId } = req.body;
    const update = {};
    if (phone !== undefined) update.phone = phone;
    if (rent !== undefined) update.rent = rent;
    if (status !== undefined) update.status = status;
    if (propertyId !== undefined) {
      const prop = await Property.findById(propertyId);
      if (!prop) return res.status(404).json({ message: 'Property not found' });
      update.property = prop._id;
    }
    const tenant = await AddTenant.findByIdAndUpdate(req.params.id, update, { new: true })
      .populate('property', 'title name address')
      .populate('user', 'name email');
    if (!tenant) return res.status(404).json({ message: 'Assignment not found' });
    res.json(tenant);
  } catch (err) {
    res.status(400).json({ message: 'Failed to update', error: err.message });
  }
}

export async function deleteAddTenant(req, res) {
  try {
    const doc = await AddTenant.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Assignment not found' });
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ message: 'Failed to delete', error: err.message });
  }
}
