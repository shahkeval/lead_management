const express = require('express');
const router = express.Router();
const {
  createRole,
  getRoles,
  updateRole,
  deleteRole,
  updateRoleRights,
  getRoleRights
} = require('../controllers/roleController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('Admin'));

router.route('/')
  .get(getRoles)
  .post(createRole);

router.route('/:id')
  .put(updateRole)
  .delete(deleteRole);

router.put('/:roleId/rights', updateRoleRights);

router.get('/:roleId/rights', getRoleRights);

module.exports = router; 