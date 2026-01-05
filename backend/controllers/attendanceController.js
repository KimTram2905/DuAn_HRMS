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
