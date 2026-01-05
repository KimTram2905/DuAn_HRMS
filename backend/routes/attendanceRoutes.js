const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { auth } = require('../middleware/auth');

router.get('/personal', auth, attendanceController.getPersonalAttendance);
router.post('/', auth, attendanceController.createAttendance);

module.exports = router;