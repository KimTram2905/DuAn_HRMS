// routes/recruitmentRoutes.js
const express = require('express');
const router = express.Router();
const recruitmentController = require('../controllers/recruitmentController');
const { auth, checkRole } = require('../middleware/auth');

// ===================== TIN TUYỂN DỤNG (U4.1) =====================
// Tất cả vai trò đều xem được danh sách tin
router.get('/jobs', auth, recruitmentController.getJobs);
router.get('/jobs/:id', auth, recruitmentController.getJobById);

// Chỉ Manager/Admin mới tạo/sửa/xóa tin
router.post('/jobs', auth, checkRole('Manager', 'Admin'), recruitmentController.createJob);
router.put('/jobs/:id', auth, checkRole('Manager', 'Admin'), recruitmentController.updateJob);
router.delete('/jobs/:id', auth, checkRole('Manager', 'Admin'), recruitmentController.deleteJob);

// ===================== NỘP HỒ SƠ (U4.2) =====================
// Candidate nộp hồ sơ (cần upload CV)
router.post('/apply', auth, checkRole('Candidate'), recruitmentController.uploadMiddleware, recruitmentController.submitApplication);

// Candidate xem hồ sơ của mình
router.get('/my-applications', auth, checkRole('Candidate'), recruitmentController.getMyApplications);

// ===================== QUẢN LÝ HỒ SƠ (U4.3 & U4.4) =====================
// Manager/Admin xem danh sách hồ sơ
router.get('/applications', auth, checkRole('Manager', 'Admin'), recruitmentController.getApplications);

// Xem chi tiết hồ sơ
router.get('/applications/:id', auth, checkRole('Manager', 'Admin'), recruitmentController.getApplicationDetail);

// Cập nhật trạng thái hồ sơ
router.put('/applications/:id/status', auth, checkRole('Manager', 'Admin'), recruitmentController.updateApplicationStatus);

// Thêm ghi chú cho hồ sơ
router.post('/applications/:id/notes', auth, checkRole('Manager', 'Admin'), recruitmentController.addApplicationNote);

module.exports = router;