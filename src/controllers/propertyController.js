// controllers/propertyController.js
import Property from '../models/Property.js';

// GET /properties
export const list = async (req, res) => {
  const { q, status } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (q) {
    filter.$or = [
      { title: new RegExp(q, 'i') },
      { description: new RegExp(q, 'i') },
      { 'address.city': new RegExp(q, 'i') },
    ];
  }
  const properties = await Property.find(filter).sort('-createdAt');
  res.render('properties/index', { title: 'Properties', properties, query: req.query });
};

// GET /properties/new
export const newForm = (req, res) => {
  res.render('properties/new', { title: 'Add Property' });
};

// POST /properties
export const create = async (req, res) => {
  const b = req.body;
  const p = await Property.create({
    title: b.title,
    address: { line1: b.line1, city: b.city, state: b.state, postcode: b.postcode },
    rent: Number(b.rent || 0),
    bedrooms: Number(b.bedrooms || 0),
    bathrooms: Number(b.bathrooms || 0),
    parking: !!b.parking,
    images: (b.images || '').split(',').map(s => s.trim()).filter(Boolean),
    description: b.description || '',
  });
  req.flash('success', 'Property added');
  res.redirect(`/properties/${p._id}`);
};

// GET /properties/:id
export const show = async (req, res) => {
  const p = await Property.findById(req.params.id);
  if (!p) return res.status(404).render('404', { title: 'Not Found' });
  res.render('properties/show', { title: p.title, property: p });
};

// GET /properties/:id/edit
export const editForm = async (req, res) => {
  const p = await Property.findById(req.params.id);
  if (!p) return res.status(404).render('404', { title: 'Not Found' });
  res.render('properties/edit', { title: 'Edit Property', property: p });
};

// PUT /properties/:id
export const update = async (req, res) => {
  const b = req.body;
  await Property.findByIdAndUpdate(req.params.id, {
    title: b.title,
    address: { line1: b.line1, city: b.city, state: b.state, postcode: b.postcode },
    rent: Number(b.rent || 0),
    bedrooms: Number(b.bedrooms || 0),
    bathrooms: Number(b.bathrooms || 0),
    parking: !!b.parking,
    status: b.status,
    images: (b.images || '').split(',').map(s => s.trim()).filter(Boolean),
    description: b.description || '',
  });
  req.flash('success', 'Property updated');
  res.redirect(`/properties/${req.params.id}`);
};

// DELETE /properties/:id
export const destroy = async (req, res) => {
  await Property.findByIdAndDelete(req.params.id);
  req.flash('success', 'Property deleted');
  res.redirect('/properties');
};
