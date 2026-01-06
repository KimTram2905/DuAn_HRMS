const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { auth } = require('../middleware/auth');

// Lấy thông tin cá nhân
router.get('/me', auth, profileController.getMyProfile);

// Gửi yêu cầu chỉnh sửa
router.post('/edit-request', auth, profileController.requestEdit);

// Lấy danh sách yêu cầu chỉnh sửa của mình
router.get('/edit-requests', auth, profileController.getMyEditRequests);

module.exports = router;