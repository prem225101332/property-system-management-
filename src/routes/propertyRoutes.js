// routes/propertyRoutes.js
import express from 'express';
import * as ctrl from '../controllers/propertyController.js';
import { requireAuth, requireAdmin } from '../utils/auth.js';

const router = express.Router();

router.get('/', requireAuth, ctrl.list);
router.get('/new', requireAuth, requireAdmin, ctrl.newForm);
router.post('/', requireAuth, requireAdmin, ctrl.create);
router.get('/:id', requireAuth, ctrl.show);
router.get('/:id/edit', requireAuth, requireAdmin, ctrl.editForm);
router.put('/:id', requireAuth, requireAdmin, ctrl.update);
router.delete('/:id', requireAuth, requireAdmin, ctrl.destroy);

export default router;
