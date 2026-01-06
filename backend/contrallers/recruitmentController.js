// controllers/recruitmentController.js
const Recruitment = require('../models/Recruitment');
const multer = require('multer');
const path = require('path');

// ===================== CẤU HÌNH UPLOAD CV =====================
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/cv/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '_' + file.originalname);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = /pdf|doc|docx/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = file.mimetype.includes('pdf') || 
                        file.mimetype.includes('word') || 
                        file.mimetype.includes('document');

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Chỉ chấp nhận file PDF, DOC, DOCX'));
    }
}).single('cv');

exports.uploadMiddleware = upload;

// ===================== QUẢN LÝ TIN TUYỂN DỤNG (U4.1) =====================

// Lấy danh sách tin tuyển dụng (tất cả vai trò)
exports.getJobs = async (req, res) => {
    try {
        const { search } = req.query;
        const jobs = await Recruitment.getAll({ search });
        res.json(jobs);
    } catch (error) {
        console.error('Get jobs error:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Lấy chi tiết tin tuyển dụng
exports.getJobById = async (req, res) => {
    try {
        const { id } = req.params;
        const job = await Recruitment.findById(id);
        
        if (!job) {
            return res.status(404).json({ message: 'Không tìm thấy tin tuyển dụng' });
        }

        res.json(job);
    } catch (error) {
        console.error('Get job by ID error:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Tạo tin tuyển dụng (Manager/Admin)
exports.createJob = async (req, res) => {
    try {
        const { viTri, mucLuong, kinhNghiem, yeuCauKyNang, yeuCauBangCap, moTaCongViec, hanNop } = req.body;

        // Validation
        if (!viTri || !moTaCongViec || !hanNop) {
            return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin bắt buộc' });
        }

        // Kiểm tra hạn nộp phải >= ngày hiện tại
        const deadline = new Date(hanNop);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (deadline < today) {
            return res.status(400).json({ message: 'Hạn nộp phải từ hôm nay trở đi' });
        }

        const jobId = await Recruitment.create({
            viTri,
            mucLuong,
            kinhNghiem,
            yeuCauKyNang,
            yeuCauBangCap,
            moTaCongViec,
            hanNop,
            nguoiDangID: req.user.id
        });

        res.status(201).json({ 
            message: 'Đăng tin tuyển dụng thành công', 
            jobId 
        });
    } catch (error) {
        console.error('Create job error:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Cập nhật tin tuyển dụng
exports.updateJob = async (req, res) => {
    try {
        const { id } = req.params;
        const { viTri, mucLuong, kinhNghiem, yeuCauKyNang, yeuCauBangCap, moTaCongViec, hanNop } = req.body;

        // Kiểm tra tin tồn tại
        const job = await Recruitment.findById(id);
        if (!job) {
            return res.status(404).json({ message: 'Không tìm thấy tin tuyển dụng' });
        }

        // Validation
        if (!viTri || !moTaCongViec || !hanNop) {
            return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin bắt buộc' });
        }

        await Recruitment.update(id, {
            viTri,
            mucLuong,
            kinhNghiem,
            yeuCauKyNang,
            yeuCauBangCap,
            moTaCongViec,
            hanNop
        });

        res.json({ message: 'Cập nhật tin tuyển dụng thành công' });
    } catch (error) {
        console.error('Update job error:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Xóa tin tuyển dụng
exports.deleteJob = async (req, res) => {
    try {
        const { id } = req.params;

        const job = await Recruitment.findById(id);
        if (!job) {
            return res.status(404).json({ message: 'Không tìm thấy tin tuyển dụng' });
        }

        await Recruitment.delete(id);
        res.json({ message: 'Xóa tin tuyển dụng thành công' });
    } catch (error) {
        console.error('Delete job error:', error);
        if (error.message.includes('hồ sơ')) {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// ===================== NỘP HỒ SƠ ỨNG TUYỂN (U4.2) =====================

// Ứng viên nộp hồ sơ
exports.submitApplication = async (req, res) => {
    try {
        const { hoTen, email, soDienThoai, tinTuyenDungID } = req.body;

        // Validation
        if (!hoTen || !email || !soDienThoai || !tinTuyenDungID) {
            return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin' });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'Vui lòng tải lên CV' });
        }

        // Kiểm tra tin tuyển dụng tồn tại và còn hạn
        const job = await Recruitment.findById(tinTuyenDungID);
        if (!job) {
            return res.status(404).json({ message: 'Tin tuyển dụng không tồn tại' });
        }

        const deadline = new Date(job.HanNop);
        const today = new Date();
        if (deadline < today) {
            return res.status(400).json({ message: 'Tin tuyển dụng đã hết hạn nộp' });
        }

        const duongDanCV = `/uploads/cv/${req.file.filename}`;

        const maHoSo = await Recruitment.submitApplication({
            hoTen,
            email,
            soDienThoai,
            tinTuyenDungID,
            duongDanCV
        });

        res.status(201).json({ 
            message: 'Nộp hồ sơ thành công', 
            maHoSo 
        });
    } catch (error) {
        console.error('Submit application error:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Ứng viên xem hồ sơ của mình
exports.getMyApplications = async (req, res) => {
    try {
        const email = req.user.email;
        const applications = await Recruitment.getMyApplications(email);
        res.json(applications);
    } catch (error) {
        console.error('Get my applications error:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// ===================== QUẢN LÝ HỒ SƠ ỨNG VIÊN (U4.3) =====================

// Lấy danh sách hồ sơ (Manager/Admin)
exports.getApplications = async (req, res) => {
    try {
        const { status, search } = req.query;
        const applications = await Recruitment.getAllApplications({ status, search });
        res.json(applications);
    } catch (error) {
        console.error('Get applications error:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// ===================== CHI TIẾT & CẬP NHẬT TRẠNG THÁI (U4.4) =====================

// Xem chi tiết hồ sơ ứng viên
exports.getApplicationDetail = async (req, res) => {
    try {
        const { id } = req.params;
        
        const application = await Recruitment.getApplicationById(id);
        if (!application) {
            return res.status(404).json({ message: 'Không tìm thấy hồ sơ' });
        }

        const notes = await Recruitment.getNotesByApplication(id);

        res.json({ application, notes });
    } catch (error) {
        console.error('Get application detail error:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Cập nhật trạng thái hồ sơ
exports.updateApplicationStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ['Moi', 'PhongVan', 'DaTuyen', 'TuChoi'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Trạng thái không hợp lệ' });
        }

        const application = await Recruitment.getApplicationById(id);
        if (!application) {
            return res.status(404).json({ message: 'Không tìm thấy hồ sơ' });
        }

        await Recruitment.updateApplicationStatus(id, status);
        res.json({ message: 'Cập nhật trạng thái thành công' });
    } catch (error) {
        console.error('Update application status error:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Thêm ghi chú cho hồ sơ
exports.addApplicationNote = async (req, res) => {
    try {
        const { id } = req.params;
        const { noiDung } = req.body;

        if (!noiDung || noiDung.trim().length === 0) {
            return res.status(400).json({ message: 'Vui lòng nhập nội dung ghi chú' });
        }

        const application = await Recruitment.getApplicationById(id);
        if (!application) {
            return res.status(404).json({ message: 'Không tìm thấy hồ sơ' });
        }

        await Recruitment.addNote({
            hoSoUngVienID: id,
            nguoiCapNhatID: req.user.id,
            noiDung
        });

        res.json({ message: 'Thêm ghi chú thành công' });
    } catch (error) {
        console.error('Add note error:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};