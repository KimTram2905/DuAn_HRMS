const express = require('express');
const router = express.Router();
const salaryController = require('../controllers/salaryController');
const { auth, checkRole } = require('../middleware/auth');

// Tính lương (Admin, Manager)
router.get('/calculate/:employeeId/:month/:year', auth, checkRole('Admin', 'Manager'), salaryController.calculateSalary);

// Lưu lương (Admin, Manager)
router.post('/save/:employeeId/:month/:year', auth, checkRole('Admin', 'Manager'), salaryController.saveSalary);

// Xem lương cá nhân (Employee)
router.get('/:employeeId', auth, salaryController.getEmployeeSalaries);

// Xem bảng lương tổng (Admin, Manager)
router.get('/', auth, checkRole('Admin', 'Manager'), salaryController.getSalaries);

// Xuất lương cá nhân (Admin, Manager)
router.get('/export/:employeeId/:month/:year/:format', auth, checkRole('Admin', 'Manager'), salaryController.exportSalary);

// Xuất Excel tổng (Admin, Manager)
router.get('/export/excel', auth, checkRole('Admin', 'Manager'), salaryController.exportExcel);

// Xuất PDF tổng (Admin, Manager)
router.get('/export/pdf', auth, checkRole('Admin', 'Manager'), salaryController.exportPDF);

module.exports = router;