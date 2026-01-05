const Employee = require('../models/Employee');
const multer = require('multer');
const path = require('path');

// Cấu hình multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) return cb(null, true);
        cb(new Error('Chỉ chấp nhận file ảnh (jpg, png)'));
    }
}).single('avatar');

exports.uploadMiddleware = upload;

// Lấy thông tin nhân viên hiện tại
exports.getEmployeeInfo = async (req, res) => {
    try {
        const employeeId = req.user.maNhanVien;
        if (!employeeId) return res.status(404).json({ message: 'Không tìm thấy thông tin nhân viên' });

        const employee = await Employee.findById(employeeId);
        if (!employee) return res.status(404).json({ message: 'Không tìm thấy thông tin nhân viên' });

        res.json(employee);
    } catch (error) {
        console.error('Get employee info error:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Lấy danh sách nhân viên
exports.getAllEmployees = async (req, res) => {
    try {
        const { search, phongBan } = req.query;
        const filters = { search, phongBan };

        if (req.user.vaiTro === 'Manager') {
            filters.phongBanId = req.user.phongBanId;
            filters.vaiTro = 'Manager';
        }

        const employees = await Employee.getAll(filters);
        res.json(employees);
    } catch (error) {
        console.error('Get all employees error:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Lấy nhân viên theo ID
exports.getEmployeeById = async (req, res) => {
    try {
        const { id } = req.params;
        const employee = await Employee.findById(id);
        if (!employee) return res.status(404).json({ message: 'Không tìm thấy nhân viên' });

        if (req.user.vaiTro === 'Manager' && employee.PhongBanID !== req.user.phongBanId) {
            return res.status(403).json({ message: 'Bạn không có quyền xem nhân viên này' });
        }

        res.json(employee);
    } catch (error) {
        console.error('Get employee by ID error:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Tạo nhân viên mới
exports.createEmployee = async (req, res) => {
    try {
        const {
            hoTen, ngaySinh, diaChi, soDienThoai, email, gioiTinh,
            phongBanID, chucVuID, loaiHopDong, ngayBatDauHopDong,
            ngayKetThucHopDong, luongCoBan
        } = req.body;

        // Validation
        if (!hoTen || !ngaySinh || !email || !soDienThoai || !gioiTinh || 
            !phongBanID || !chucVuID || !loaiHopDong || !ngayBatDauHopDong || !luongCoBan) {
            return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin bắt buộc' });
        }

        if (await Employee.checkEmailExists(email)) return res.status(400).json({ message: 'Email đã tồn tại' });
        if (await Employee.checkPhoneExists(soDienThoai)) return res.status(400).json({ message: 'Số điện thoại đã tồn tại' });

        const birthDate = new Date(ngaySinh);
        const age = (new Date() - birthDate) / (365.25 * 24 * 60 * 60 * 1000);
        if (age < 18) return res.status(400).json({ message: 'Nhân viên phải từ 18 tuổi trở lên' });

        const anhDaiDien = req.file ? `/uploads/${req.file.filename}` : null;

        const result = await Employee.create({
            hoTen, ngaySinh, diaChi, soDienThoai, email, gioiTinh,
            phongBanID, chucVuID, loaiHopDong, ngayBatDauHopDong,
            ngayKetThucHopDong, luongCoBan, anhDaiDien
        });

        res.status(201).json({
            message: 'Thêm nhân viên thành công',
            employeeId: result.employeeId,
            username: result.username,
            password: result.password
        });
    } catch (error) {
        console.error('Create employee error:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Cập nhật nhân viên
exports.updateEmployee = async (req,res) => {
    try {
        const { id } = req.params;
        const {
            hoTen, ngaySinh, diaChi, soDienThoai, email, gioiTinh,
            phongBanID, chucVuID, loaiHopDong, ngayBatDauHopDong,
            ngayKetThucHopDong, luongCoBan
        } = req.body;

        const employee = await Employee.findById(id);
        if (!employee) return res.status(404).json({ message: 'Không tìm thấy nhân viên' });

        if (req.user.vaiTro === 'Manager' && employee.PhongBanID !== req.user.phongBanId) {
            return res.status(403).json({ message: 'Bạn không có quyền chỉnh sửa nhân viên này' });
        }

        if (!hoTen || !ngaySinh || !email || !soDienThoai || !gioiTinh || 
            !phongBanID || !chucVuID || !loaiHopDong || !ngayBatDauHopDong || !luongCoBan) {
            return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin bắt buộc' });
        }

        if (await Employee.checkEmailExists(email, id)) return res.status(400).json({ message: 'Email đã tồn tại' });
        if (await Employee.checkPhoneExists(soDienThoai, id)) return res.status(400).json({ message: 'Số điện thoại đã tồn tại' });

        const anhDaiDien = req.file ? `/uploads/${req.file.filename}` : employee.AnhDaiDien;

        await Employee.update(id, {
            hoTen, ngaySinh, diaChi, soDienThoai, email, gioiTinh,
            phongBanID, chucVuID, loaiHopDong, ngayBatDauHopDong,
            ngayKetThucHopDong, luongCoBan, anhDaiDien
        }, req.user.id);

        res.json({ message: 'Cập nhật thông tin nhân viên thành công' });
    } catch (error) {
        console.error('Update employee error:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Xóa nhân viên
exports.deleteEmployee = async (req, res) => {
    try {
        const { id } = req.params;
        const employee = await Employee.findById(id);
        if (!employee) return res.status(404).json({ message: 'Không tìm thấy nhân viên' });

        await Employee.delete(id, req.user.id);
        res.json({ message: 'Xóa nhân viên thành công' });
    } catch (error) {
        console.error('Delete employee error:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Lấy danh sách phòng ban
exports.getDepartments = async (req, res) => {
    try {
        const departments = await Employee.getDepartments();
        res.json(departments);
    } catch (error) {
        console.error('Get departments error:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Lấy danh sách chức vụ
exports.getPositions = async (req, res) => {
    try {
        const positions = await Employee.getPositions();
        res.json(positions);
    } catch (error) {
        console.error('Get positions error:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};
