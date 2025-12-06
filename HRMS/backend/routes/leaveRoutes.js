const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveController');
const { auth, checkRole } = require('../middleware/auth');

router.post('/request', auth, leaveController.requestLeave);
router.get('/my-requests', auth, leaveController.getMyLeaveRequests);

//PHẦN CỦA PHẤN
// ===================== LEAVE APPROVAL ROUTES =====================
router.get('/approval', auth, checkRole('Admin', 'Manager'), leaveController.getLeaveRequestsForApproval);
router.put('/approval/:id', auth, checkRole('Admin', 'Manager'), leaveController.processLeaveRequest);

module.exports = router;