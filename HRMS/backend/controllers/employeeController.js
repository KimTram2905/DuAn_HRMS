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

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Chỉ chấp nhận file ảnh (jpg, png)'));
    }
}).single('avatar');

exports.uploadMiddleware = upload;

exports.getAllEmployees = async (req, res) => {
    try {
        const { search, phongBan } = req.query;
        const filters = { search, phongBan };

        // Manager chỉ xem nhân viên trong phòng ban của mình
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

exports.deleteEmployee = async (req, res) => {
    try {
        const { id } = req.params;

        const employee = await Employee.findById(id);
        if (!employee) {
            return res.status(404).json({ message: 'Không tìm thấy nhân viên' });
        }

        await Employee.delete(id, req.user.id);

        res.json({ message: 'Xóa nhân viên thành công' });
    } catch (error) {
        console.error('Delete employee error:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// ... (giữ nguyên getAllEmployees và deleteEmployee từ trước)

exports.getDepartments = async (req, res) => {
    try {
        const departments = await Employee.getDepartments();
        res.json(departments);
    } catch (error) {
        console.error('Get departments error:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// ... (giữ nguyên getAllEmployees, deleteEmployee, getDepartments từ Thành viên 5-2)

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

        // Kiểm tra email trùng
        const emailExists = await Employee.checkEmailExists(email);
        if (emailExists) {
            return res.status(400).json({ message: 'Email đã tồn tại trong hệ thống' });
        }

        // Kiểm tra SĐT trùng
        const phoneExists = await Employee.checkPhoneExists(soDienThoai);
        if (phoneExists) {
            return res.status(400).json({ message: 'Số điện thoại đã tồn tại trong hệ thống' });
        }

        // Kiểm tra tuổi >= 18
        const birthDate = new Date(ngaySinh);
        const age = (new Date() - birthDate) / (365.25 * 24 * 60 * 60 * 1000);
        if (age < 18) {
            return res.status(400).json({ message: 'Nhân viên phải từ 18 tuổi trở lên' });
        }

        const anhDaiDien = req.file ? `/uploads/${req.file.filename}` : null;

        const employeeId = await Employee.create({
            hoTen, ngaySinh, diaChi, soDienThoai, email, gioiTinh,
            phongBanID, chucVuID, loaiHopDong, ngayBatDauHopDong,
            ngayKetThucHopDong, luongCoBan, anhDaiDien
        });

        res.status(201).json({
            message: 'Thêm nhân viên thành công',
            employeeId
        });
    } catch (error) {
        console.error('Create employee error:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

exports.updateEmployee = async (req,res) => {
    try {
        const { id } = req.params;
        const {
            hoTen, ngaySinh, diaChi, soDienThoai, email, gioiTinh,
            phongBanID, chucVuID, loaiHopDong, ngayBatDauHopDong,
            ngayKetThucHopDong, luongCoBan
        } = req.body;

        // Kiểm tra nhân viên tồn tại
        const employee = await Employee.findById(id);
        if (!employee) {
            return res.status(404).json({ message: 'Không tìm thấy nhân viên' });
        }

        // Manager chỉ sửa nhân viên trong phòng ban của mình
        if (req.user.vaiTro === 'Manager' && employee.PhongBanID !== req.user.phongBanId) {
            return res.status(403).json({ message: 'Bạn không có quyền chỉnh sửa nhân viên này' });
        }

        // Validation
        if (!hoTen || !ngaySinh || !email || !soDienThoai || !gioiTinh || 
            !phongBanID || !chucVuID || !loaiHopDong || !ngayBatDauHopDong || !luongCoBan) {
            return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin bắt buộc' });
        }

        // Kiểm tra email trùng (ngoại trừ chính nó)
        const emailExists = await Employee.checkEmailExists(email, id);
        if (emailExists) {
            return res.status(400).json({ message: 'Email đã tồn tại trong hệ thống' });
        }

        // Kiểm tra SĐT trùng (ngoại trừ chính nó)
        const phoneExists = await Employee.checkPhoneExists(soDienThoai, id);
        if (phoneExists) {
            return res.status(400).json({ message: 'Số điện thoại đã tồn tại trong hệ thống' });
        }

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

exports.getEmployeeById = async (req, res) => {
    try {
        const { id } = req.params;
        const employee = await Employee.findById(id);

        if (!employee) {
            return res.status(404).json({ message: 'Không tìm thấy nhân viên' });
        }

        // Manager chỉ xem nhân viên trong phòng ban của mình
        if (req.user.vaiTro === 'Manager' && employee.PhongBanID !== req.user.phongBanId) {
            return res.status(403).json({ message: 'Bạn không có quyền xem nhân viên này' });
        }

        res.json(employee);
    } catch (error) {
        console.error('Get employee by ID error:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

exports.getPositions = async (req, res) => {
    try {
        const positions = await Employee.getPositions();
        res.json(positions);
    } catch (error) {
        console.error('Get positions error:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};