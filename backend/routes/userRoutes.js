const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { auth, checkRole } = require('../middleware/auth');

// Lấy danh sách người dùng (Admin)
router.get('/', auth, checkRole('Admin'), userController.getAllUsers);

// Cập nhật vai trò (Admin)
router.put('/role', auth, checkRole('Admin'), userController.updateRole);

// Lấy danh sách vai trò
router.get('/roles', auth, checkRole('Admin'), userController.getRoles);

module.exports = router;
