const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const { auth, checkRole } = require('../middleware/auth');

// Lấy danh sách nhân viên (Manager, Admin)
router.get('/', auth, checkRole('Manager', 'Admin'), employeeController.getAllEmployees);

// Xóa nhân viên (Admin)
router.delete('/:id', auth, checkRole('Admin'), employeeController.deleteEmployee);

// Lấy danh sách phòng ban
router.get('/data/departments', auth, employeeController.getDepartments);

module.exports = router;