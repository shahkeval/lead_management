const express = require('express');
const router = express.Router();
const {
  createMeeting,
  getMeetings,
  updateMeeting,
  deleteMeeting,
  get_persone_meeting
} = require('../controllers/meetingController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('Admin', 'sales manager', 'sales person'));

router.route('/')
  .get(getMeetings)
  .post(createMeeting);

router.route('/:id')
  .put(updateMeeting)
  .delete(deleteMeeting);

router.route('/get_persone_meeting').get(get_persone_meeting);

module.exports = router;
