const Reward = require('../models/Reward');
const Employee = require('../models/Employee');

// Lấy danh sách thưởng/phạt (Manager chỉ xem phòng ban của mình)
exports.getRewards = async (req, res) => {
    try {
        let rewards;
        if (req.user.vaiTro === 'Manager') {
            rewards = await Reward.getByDepartment(req.user.phongBanId);
        } else if (req.user.vaiTro === 'Admin') {
            rewards = await Reward.getAll();
        } else {
            return res.status(403).json({ message: 'Bạn không có quyền truy cập' });
        }
        res.json(rewards);
    } catch (error) {
        console.error('Get rewards error:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Thêm mới thưởng/phạt
exports.createReward = async (req, res) => {
    try {
        const { nhanVienID, loai, soTien, lyDo } = req.body;

        // Validation
        if (!nhanVienID || !loai || !soTien || !lyDo) {
            return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin' });
        }
        if (soTien <= 0) {
            return res.status(400).json({ message: 'Số tiền phải lớn hơn 0' });
        }
        if (!['Thuong', 'Phat'].includes(loai)) {
            return res.status(400).json({ message: 'Loại phải là Thưởng hoặc Phạt' });
        }

        // Kiểm tra nhân viên thuộc phòng ban (Manager)
        if (req.user.vaiTro === 'Manager') {
            const employee = await Employee.findById(nhanVienID);
            if (!employee || employee.PhongBanID !== req.user.phongBanId) {
                return res.status(403).json({ message: 'Bạn không có quyền quản lý nhân viên này' });
            }
        }

        const rewardId = await Reward.create({ nhanVienID, loai, soTien, lyDo });
        res.status(201).json({ message: 'Thêm mới thành công', rewardId });
    } catch (error) {
        console.error('Create reward error:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Cập nhật thưởng/phạt
exports.updateReward = async (req, res) => {
    try {
        const { id } = req.params;
        const { nhanVienID, loai, soTien, lyDo } = req.body;

        // Validation giống create
        if (!nhanVienID || !loai || !soTien || !lyDo) {
            return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin' });
        }
        if (soTien <= 0) {
            return res.status(400).json({ message: 'Số tiền phải lớn hơn 0' });
        }
        if (!['Thuong', 'Phat'].includes(loai)) {
            return res.status(400).json({ message: 'Loại phải là Thưởng hoặc Phạt' });
        }

        // Kiểm tra quyền và nhân viên
        const reward = await Reward.findById(id);
        if (!reward) {
            return res.status(404).json({ message: 'Không tìm thấy khoản thưởng/phạt' });
        }
        if (req.user.vaiTro === 'Manager') {
            const employee = await Employee.findById(nhanVienID);
            if (!employee || employee.PhongBanID !== req.user.phongBanId) {
                return res.status(403).json({ message: 'Bạn không có quyền quản lý nhân viên này' });
            }
        }

        await Reward.update(id, { nhanVienID, loai, soTien, lyDo });
        res.json({ message: 'Cập nhật thành công' });
    } catch (error) {
        console.error('Update reward error:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Xóa thưởng/phạt
exports.deleteReward = async (req, res) => {
    try {
        const { id } = req.params;

        const reward = await Reward.findById(id);
        if (!reward) {
            return res.status(404).json({ message: 'Không tìm thấy khoản thưởng/phạt' });
        }

        // Kiểm tra quyền (Manager chỉ xóa trong phòng ban)
        if (req.user.vaiTro === 'Manager') {
            const employee = await Employee.findById(reward.NhanVienID);
            if (!employee || employee.PhongBanID !== req.user.phongBanId) {
                return res.status(403).json({ message: 'Bạn không có quyền xóa khoản này' });
            }
        }

        await Reward.delete(id);
        res.json({ message: 'Xóa thành công' });
    } catch (error) {
        console.error('Delete reward error:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};