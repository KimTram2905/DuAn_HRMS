const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const { auth, checkRole } = require('../middleware/auth');

// Lấy thông tin cá nhân (Nhân viên)
router.get('/me', auth, employeeController.getEmployeeInfo);

// Lấy danh sách nhân viên (Manager, Admin)
router.get('/', auth, checkRole('Manager', 'Admin'), employeeController.getAllEmployees);

// Lấy thông tin nhân viên theo ID
router.get('/:id', auth, checkRole('Manager', 'Admin'), employeeController.getEmployeeById);

// Thêm nhân viên mới (Admin)
router.post('/', auth, checkRole('Admin'), employeeController.uploadMiddleware, employeeController.createEmployee);

// Cập nhật thông tin nhân viên (Admin, Manager)
router.put('/:id', auth, checkRole('Admin', 'Manager'), employeeController.uploadMiddleware, employeeController.updateEmployee);

// Xóa nhân viên (Admin)
router.delete('/:id', auth, checkRole('Admin'), employeeController.deleteEmployee);

// Lấy danh sách phòng ban
router.get('/data/departments', auth, employeeController.getDepartments);

// Lấy danh sách chức vụ
router.get('/data/positions', auth, employeeController.getPositions);

module.exports = router;