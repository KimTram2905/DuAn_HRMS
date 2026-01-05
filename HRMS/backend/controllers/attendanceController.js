const Attendance = require('../models/Attendance');

// ===================== GET PERSONAL ATTENDANCE =====================
exports.getPersonalAttendance = async (req, res) => {
    try {
        // Kiểm tra nếu là Admin thì không cho phép
        if (req.user.vaiTro === 'Admin') {
            return res.status(403).json({ 
                message: 'Quản trị viên không có chức năng chấm công' 
            });
        }

        const employeeId = req.user.maNhanVien;
        const { startDate, endDate, month, year } = req.query;

        let attendance = [];
        let leaveDays = [];

        if (startDate && endDate) {
            // Lọc theo khoảng thời gian (logic mở rộng)
            attendance = await Attendance.getByDateRange(employeeId, startDate, endDate);
            leaveDays = await Attendance.getLeaveDaysByDateRange(employeeId, startDate, endDate);

        } else if (month && year) {
            // Lọc theo tháng / năm (logic cũ vẫn giữ nguyên)
            attendance = await Attendance.getByEmployeeId(employeeId, month, year);
            leaveDays = await Attendance.getLeaveDays(employeeId, month, year);

        } else {
            return res.status(400).json({ 
                message: 'Vui lòng chọn khoảng thời gian hoặc tháng/năm' 
            });
        }

        res.json({ attendance, leaveDays });

    } catch (error) {
        console.error('Get personal attendance error:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// ===================== CREATE ATTENDANCE =====================
exports.createAttendance = async (req, res) => {
    try {
        // Kiểm tra nếu là Admin thì không cho phép
        if (req.user.vaiTro === 'Admin') {
            return res.status(403).json({ 
                message: 'Quản trị viên không có chức năng chấm công' 
            });
        }

        const { ngay, gioVao, gioRa } = req.body;
        const nhanVienID = req.user.maNhanVien;

        const attendanceId = await Attendance.create({ 
            nhanVienID, 
            ngay, 
            gioVao, 
            gioRa 
        });

        res.status(201).json({ 
            message: 'Thêm chấm công thành công', 
            attendanceId 
        });

    } catch (error) {
        console.error('Create attendance error:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};
// ===================== ADMIN ATTENDANCE MANAGEMENT =====================
exports.getAttendanceManagement = async (req, res) => {
    try {
        const { phongBan, month, year, startDate, endDate } = req.query;
        
        let attendance = [];
        
        if (startDate && endDate) {
            // Lọc theo khoảng thời gian
            attendance = await Attendance.getByDateRangeManagement({ 
                phongBan, 
                startDate, 
                endDate 
            });
        } else if (month && year) {
            // Lọc theo tháng/năm
            attendance = await Attendance.getByMonthManagement({ 
                phongBan, 
                month, 
                year 
            });
        } else {
            // Mặc định hiển thị tháng hiện tại
            const currentDate = new Date();
            attendance = await Attendance.getByMonthManagement({ 
                phongBan, 
                month: currentDate.getMonth() + 1, 
                year: currentDate.getFullYear() 
            });
        }

        res.json({ attendance });
    } catch (error) {
        console.error('Get attendance management error:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

exports.createAttendanceForEmployee = async (req, res) => {
    try {
        // Admin không được chấm công
        if (req.user.vaiTro === 'Admin') {
            return res.status(403).json({ 
                message: 'Quản trị viên không có chức năng chấm công' 
            });
        }

        const { nhanVienID, ngay, gioVao, gioRa } = req.body;

        // Validation
        if (!nhanVienID || !ngay || !gioVao) {
            return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin bắt buộc' });
        }

        // Kiểm tra nhân viên thuộc phòng ban của Manager
        if (req.user.vaiTro === 'Manager') {
            const employee = await Attendance.checkEmployeeDepartment(nhanVienID, req.user.phongBanId);
            if (!employee) {
                return res.status(403).json({ 
                    message: 'Bạn chỉ được chấm công cho nhân viên trong phòng ban của mình' 
                });
            }
        }

        // Kiểm tra chấm công đã tồn tại
        const existingAttendance = await Attendance.checkExisting(nhanVienID, ngay);
        if (existingAttendance) {
            return res.status(400).json({ message: 'Nhân viên đã được chấm công vào ngày này' });
        }

        const attendanceId = await Attendance.create({ 
            nhanVienID, 
            ngay, 
            gioVao, 
            gioRa 
        });

        res.status(201).json({ 
            message: 'Chấm công thành công', 
            attendanceId 
        });
    } catch (error) {
        console.error('Create attendance for employee error:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};
// ===================== UPDATE ATTENDANCE =====================
exports.updateAttendance = async (req, res) => {
    try {
        // Admin không được sửa chấm công
        if (req.user.vaiTro === 'Admin') {
            return res.status(403).json({ 
                message: 'Quản trị viên không có chức năng sửa chấm công' 
            });
        }

        const { id } = req.params;
        const { gioVao, gioRa } = req.body;

        // Validation
        if (!gioVao) {
            return res.status(400).json({ message: 'Giờ vào là bắt buộc' });
        }

        // Kiểm tra chấm công tồn tại
        const attendance = await Attendance.findById(id);
        if (!attendance) {
            return res.status(404).json({ message: 'Không tìm thấy bản ghi chấm công' });
        }

        // Kiểm tra quyền (Manager chỉ sửa nhân viên trong phòng ban)
        if (req.user.vaiTro === 'Manager') {
            const employee = await Attendance.checkEmployeeDepartment(attendance.NhanVienID, req.user.phongBanId);
            if (!employee) {
                return res.status(403).json({ 
                    message: 'Bạn chỉ được sửa chấm công cho nhân viên trong phòng ban của mình' 
                });
            }
        }

        await Attendance.update(id, { gioVao, gioRa });

        res.json({ message: 'Cập nhật chấm công thành công' });
    } catch (error) {
        console.error('Update attendance error:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// ===================== DELETE ATTENDANCE =====================
exports.deleteAttendance = async (req, res) => {
    try {
        // Admin không được xóa chấm công
        if (req.user.vaiTro === 'Admin') {
            return res.status(403).json({ 
                message: 'Quản trị viên không có chức năng xóa chấm công' 
            });
        }

        const { id } = req.params;

        // Kiểm tra chấm công tồn tại
        const attendance = await Attendance.findById(id);
        if (!attendance) {
            return res.status(404).json({ message: 'Không tìm thấy bản ghi chấm công' });
        }

        // Kiểm tra quyền (Manager chỉ xóa nhân viên trong phòng ban)
        if (req.user.vaiTro === 'Manager') {
            const employee = await Attendance.checkEmployeeDepartment(attendance.NhanVienID, req.user.phongBanId);
            if (!employee) {
                return res.status(403).json({ 
                    message: 'Bạn chỉ được xóa chấm công cho nhân viên trong phòng ban của mình' 
                });
            }
        }

        await Attendance.delete(id);

        res.json({ message: 'Xóa chấm công thành công' });
    } catch (error) {
        console.error('Delete attendance error:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};