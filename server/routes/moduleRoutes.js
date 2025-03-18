const express = require('express');
const router = express.Router();
const {
  createModule,
  getModules,
  updateModule
} = require('../controllers/moduleController');
const { protect, authorize } = require('../middleware/auth');
const Module = require('../models/Module');

router.use(protect);
router.use(authorize('Admin'));

router.route('/')
  .get(getModules)
  .post(createModule);

router.route('/:id')
  .put(updateModule);

// Get all modules
router.get('/', async (req, res) => {
  try {
    const modules = await Module.find({ isDeleted: false }).sort('moduleName');
    res.json({
      success: true,
      modules
    });
  } catch (error) {
    console.error('Error fetching modules:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching modules'
    });
  }
});

router.post('/modules', createModule);
router.get('/modules', getModules);

module.exports = router; 