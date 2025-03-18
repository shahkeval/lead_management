const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  get_persone_user
} = require('../controllers/userController');

// Protect all routes
router.use(protect);
router.use(authorize('Admin','sales person','sales manager'));

// New route for fetching users
router.get('/list', getUsers);

router.route('/')
  .get(getUsers)
  .post(createUser);

router.route('/:id')
  .put(updateUser)
  .delete(deleteUser);

// Get all users
router.get('/', getUsers);

// Get specific users
router.get("/get_persone_user", get_persone_user);

module.exports = router; 