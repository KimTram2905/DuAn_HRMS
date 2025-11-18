const Employee = require('../models/Employee');

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