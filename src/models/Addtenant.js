// src/models/AddTenant.js
import mongoose from 'mongoose';

const AddTenantSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    phone: { type: String, default: '' },
    rent: { type: Number, default: 0 },
    status: { type: String, enum: ['paid', 'overdue'], default: 'paid' },
    property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property' }
  },
  { timestamps: true }
);

export default mongoose.model('AddTenant', AddTenantSchema);
