// routes/propertyRoutes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/propertyController');

// OPTIONAL: your existing auth/role middleware
const { requireAuth, requireAdmin } = require('../utils/auth'); 
// If you don't have these yet, see small stub below.

router.get('/', requireAuth, ctrl.list);
router.get('/new', requireAuth, requireAdmin, ctrl.newForm);
router.post('/', requireAuth, requireAdmin, ctrl.create);
router.get('/:id', requireAuth, ctrl.show);
router.get('/:id/edit', requireAuth, requireAdmin, ctrl.editForm);
router.put('/:id', requireAuth, requireAdmin, ctrl.update);
router.delete('/:id', requireAuth, requireAdmin, ctrl.destroy);

module.exports = router;
