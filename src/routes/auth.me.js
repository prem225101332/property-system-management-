// src/routes/auth.me.js
import { Router } from 'express';
import { authRequired } from '../middleware/auth.js';

const r = Router();

r.get('/auth/me', authRequired, (req, res) => {
  const { name = '', email = '', role = '', phone = null } = req.user || {};
  if (!email) return res.status(401).json({ message: 'Unauthorized' });
  res.json({ name, email, role, phone });
});

export default r;
