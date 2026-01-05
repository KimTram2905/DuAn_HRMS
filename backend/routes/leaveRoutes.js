const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveController');
const { auth } = require('../middleware/auth');

router.post('/request', auth, leaveController.requestLeave);
router.get('/my-requests', auth, leaveController.getMyLeaveRequests);

module.exports = router;