const Employee = require('../models/Employee');
const EditRequest = require('../models/EditRequest');

exports.getMyProfile = async (req, res) => {
    try {
        const employeeId = req.user.maNhanVien;

        if (!employeeId) {
            return res.status(404).json({ message: 'Không tìm thấy thông tin nhân viên' });
        }

        const employee = await Employee.findById(employeeId);

        if (!employee) {
            return res.status(404).json({ message: 'Không tìm thấy thông tin nhân viên' });
        }

        res.json(employee);
    } catch (error) {
        console.error('Get my profile error:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

exports.requestEdit = async (req, res) => {
    try {
        const employeeId = req.user.maNhanVien;
        const { fieldName, currentValue, newValue, reason } = req.body;

        if (!fieldName || !newValue || !reason) {
            return res.status(400).json({ 
                message: 'Vui lòng điền đầy đủ thông tin: trường cần sửa, giá trị mới và lý do' 
            });
        }

        const requestId = await EditRequest.create(employeeId, {
            fieldName,
            currentValue: currentValue || '',
            newValue,
            reason
        });

        // Gửi thông báo đến admin
        await EditRequest.notifyAdmins(employeeId, requestId);

        res.json({ 
            message: 'Yêu cầu cập nhật thông tin đã được gửi thành công',
            requestId 
        });
    } catch (error) {
        console.error('Request edit error:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

exports.getMyEditRequests = async (req, res) => {
    try {
        const employeeId = req.user.maNhanVien;
        const requests = await EditRequest.getByEmployeeId(employeeId);
        res.json(requests);
    } catch (error) {
        console.error('Get edit requests error:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};