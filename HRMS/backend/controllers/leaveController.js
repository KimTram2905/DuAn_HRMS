const Leave = require('../models/Leave');
const Attendance = require('../models/Attendance');

exports.requestLeave = async (req, res) => {
    try {
        // Kiểm tra nếu là Admin thì không cho phép
        if (req.user.vaiTro === 'Admin') {
            return res.status(403).json({ 
                message: 'Quản trị viên không có chức năng xin nghỉ phép' 
            });
        }
        const { loaiNghi, ngayBatDau, ngayKetThuc, lyDo } = req.body;
        const nhanVienID = req.user.maNhanVien;

        if (!loaiNghi || !ngayBatDau || !ngayKetThuc || !lyDo) {
            return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin' });
        }

        const conflict = await Leave.checkConflict(nhanVienID, ngayBatDau, ngayKetThuc);
        if (conflict) {
            return res.status(400).json({ message: 'Ngày đó đã có đơn nghỉ' });
        }

        const requestId = await Leave.create({ nhanVienID, loaiNghi, ngayBatDau, ngayKetThuc, lyDo });
        await Leave.notifyApprovers(requestId);

        res.status(201).json({ message: 'Yêu cầu nghỉ phép đã được gửi', requestId });
    } catch (error) {
        console.error('Request leave error:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

exports.getMyLeaveRequests = async (req, res) => {
    try {
        // Kiểm tra nếu là Admin thì không cho phép
        if (req.user.vaiTro === 'Admin') {
            return res.status(403).json({ 
                message: 'Quản trị viên không có chức năng xin nghỉ phép' 
            });
        }
        const employeeId = req.user.maNhanVien;
        const requests = await Leave.getByEmployeeId(employeeId);
        res.json(requests);
    } catch (error) {
        console.error('Get leave requests error:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};
//PHẦN CỦA PHẤN
// ===================== GET LEAVE REQUESTS FOR APPROVAL =====================
exports.getLeaveRequestsForApproval = async (req, res) => {
    try {
        let leaveRequests;

        if (req.user.vaiTro === 'Manager') {
            // Manager chỉ xem đơn của nhân viên trong phòng ban mình
            leaveRequests = await Leave.getByDepartmentForApproval(req.user.phongBanId);
        } else if (req.user.vaiTro === 'Admin') {
            // Admin xem tất cả đơn
            leaveRequests = await Leave.getAllForApproval();
        } else {
            return res.status(403).json({ message: 'Bạn không có quyền phê duyệt' });
        }

        res.json(leaveRequests);
    } catch (error) {
        console.error('Get leave requests for approval error:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// ===================== APPROVE/REJECT LEAVE REQUEST =====================

exports.processLeaveRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const { action } = req.body; // Loại bỏ ghiChu khỏi destructuring

        if (!['approve', 'reject'].includes(action)) {
            return res.status(400).json({ message: 'Hành động không hợp lệ' });
        }

        // Kiểm tra đơn tồn tại
        const leaveRequest = await Leave.findById(id);
        if (!leaveRequest) {
            return res.status(404).json({ message: 'Không tìm thấy đơn xin nghỉ phép' });
        }

        // Kiểm tra quyền
        if (req.user.vaiTro === 'Manager') {
            // Manager không thể phê duyệt đơn của chính mình
            if (leaveRequest.NhanVienID === req.user.maNhanVien) {
                return res.status(403).json({ message: 'Bạn không thể phê duyệt đơn của chính mình' });
            }
            
            // Manager chỉ phê duyệt đơn của nhân viên trong phòng ban mình
            const employee = await Leave.checkEmployeeDepartment(leaveRequest.NhanVienID, req.user.phongBanId);
            if (!employee) {
                return res.status(403).json({ message: 'Bạn chỉ được phê duyệt đơn của nhân viên trong phòng ban của mình' });
            }
        }

        const newStatus = action === 'approve' ? 'DaDuyet' : 'TuChoi';
        await Leave.updateStatus(id, newStatus, req.user.maNhanVien); // Loại bỏ ghiChu

        // Thêm logic: Nếu phê duyệt, tự động tạo chấm công cho các ngày nghỉ
        if (newStatus === 'DaDuyet') {
    const startDate = new Date(leaveRequest.NgayBatDau);
    const endDate = new Date(leaveRequest.NgayKetThuc);

    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');

        const ngay = `${yyyy}-${mm}-${dd}`; // YYYY-MM-DD
        await Attendance.createLeaveAttendance(leaveRequest.NhanVienID, ngay);
    }
}


        res.json({ 
            message: action === 'approve' ? 'Phê duyệt đơn thành công' : 'Từ chối đơn thành công' 
        });
    } catch (error) {
        console.error('Process leave request error:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};