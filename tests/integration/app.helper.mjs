import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import authRoutes from '../../src/routes/auth.js';
import propertyRoutes from '../../src/routes/propertyRoutes.js';
import addTenantRoutes from '../../src/routes/addTenantRoutes.js';

export function makeApp() {
  const app = express();
  app.use(cors());
  app.use(morgan('dev'));
  app.use(express.json());
  app.use('/api/auth', authRoutes);
  app.use('/api/properties', propertyRoutes);
  app.use('/api', addTenantRoutes);
  app.use((err, _req, res, _next) => {
    console.error('Unhandled error', err);
    res.status(500).json({ message: 'Server error' });
  });
  return app;
}
