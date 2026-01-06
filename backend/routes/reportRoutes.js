// routes/reportRoutes.js
const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { auth, checkRole } = require('../middleware/auth');

// Chỉ Admin và Manager có quyền xem báo cáo
const reportAccess = checkRole('Admin', 'Manager');

// ===================== LẤY DỮ LIỆU BÁO CÁO =====================

// U5.1 - Báo cáo nhân sự
router.get('/employee', auth, reportAccess, reportController.getEmployeeReport);

// U5.2 - Báo cáo chấm công
router.get('/attendance', auth, reportAccess, reportController.getAttendanceReport);

// U5.3 - Báo cáo lương
router.get('/salary', auth, reportAccess, reportController.getSalaryReport);

// ===================== XUẤT BÁO CÁO =====================

// Xuất Excel
router.get('/export/excel', auth, reportAccess, reportController.exportToExcel);

// Xuất PDF
router.get('/export/pdf', auth, reportAccess, reportController.exportToPDF);

// ===================== LỊCH SỬ BÁO CÁO =====================

router.get('/history', auth, reportAccess, reportController.getReportHistory);

module.exports = router;