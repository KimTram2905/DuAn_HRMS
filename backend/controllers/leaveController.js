const Leave = require('../models/Leave');

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