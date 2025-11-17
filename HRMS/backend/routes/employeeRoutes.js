const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const { auth, checkRole } = require('../middleware/auth');

// Các route cụ thể nên đặt TRƯỚC route có tham số
router.get('/data/departments', auth, employeeController.getDepartments);
router.get('/data/positions', auth, employeeController.getPositions);

// Lấy danh sách nhân viên (Manager, Admin)
router.get('/', auth, checkRole('Manager', 'Admin'), employeeController.getAllEmployees);

// Lấy thông tin chi tiết nhân viên (Manager, Admin) - ĐẶT SAU CÁC ROUTE CỤ THỂ
router.get('/:id', auth, checkRole('Manager', 'Admin'), employeeController.getEmployeeById);

// Xóa nhân viên (Admin)
router.delete('/:id', auth, checkRole('Admin'), employeeController.deleteEmployee);

// Thêm nhân viên mới (Admin)
router.post('/', auth, checkRole('Admin'), employeeController.uploadMiddleware, employeeController.createEmployee);

// Cập nhật thông tin nhân viên (Admin, Manager)
router.put('/:id', auth, checkRole('Admin', 'Manager'), employeeController.uploadMiddleware, employeeController.updateEmployee);

module.exports = router;