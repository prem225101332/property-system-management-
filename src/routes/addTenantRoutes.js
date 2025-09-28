// src/routes/addTenantRoutes.js
import { Router } from 'express';
import {
  listTenantUsers,
  listAddTenants,
  getAddTenant,
  upsertAddTenant,
  updateAddTenant,
  deleteAddTenant
} from '../controllers/addTenantController.js';

const r = Router();
r.get('/addtenants/tenant-users', listTenantUsers);
r.get('/addtenants', listAddTenants);
r.get('/addtenants/:id', getAddTenant);
r.post('/addtenants/upsert', upsertAddTenant);
r.put('/addtenants/:id', updateAddTenant);
r.delete('/addtenants/:id', deleteAddTenant);
export default r;
