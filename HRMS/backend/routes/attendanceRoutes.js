const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { auth, checkRole } = require('../middleware/auth');

// Routes cho cá nhân (giữ nguyên)
router.get('/personal', auth, attendanceController.getPersonalAttendance);
router.post('/', auth, attendanceController.createAttendance);

//PHẦN CỦA PHẤN
// ===================== ADMIN/MANAGER ATTENDANCE MANAGEMENT =====================
router.get('/management', auth, checkRole('Admin', 'Manager'), attendanceController.getAttendanceManagement);
router.post('/management', auth, checkRole('Admin', 'Manager'), attendanceController.createAttendanceForEmployee);
// ===================== UPDATE & DELETE ATTENDANCE =====================
router.put('/management/:id', auth, checkRole('Admin', 'Manager'), attendanceController.updateAttendance);
router.delete('/management/:id', auth, checkRole('Admin', 'Manager'), attendanceController.deleteAttendance);

module.exports = router;