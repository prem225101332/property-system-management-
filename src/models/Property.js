// models/Property.js
const mongoose = require('mongoose');

const AddressSchema = new mongoose.Schema({
  line1: String,
  city: String,
  state: String,
  postcode: String,
}, { _id: false });

const PropertySchema = new mongoose.Schema({
  title: { type: String, required: true },
  address: AddressSchema,
  rent: { type: Number, required: true },            // monthly rent
  bedrooms: Number,
  bathrooms: Number,
  parking: { type: Boolean, default: false },
  images: [String],
  status: { type: String, enum: ['AVAILABLE', 'OCCUPIED'], default: 'AVAILABLE' },
  description: String,
}, { timestamps: true });

module.exports = mongoose.model('Property', PropertySchema);
