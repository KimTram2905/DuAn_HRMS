const User = require('../models/User');

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.getAllUsers();
        res.json(users);
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

exports.updateRole = async (req, res) => {
    try {
        const { userId, roleId } = req.body;

        if (!userId || !roleId) {
            return res.status(400).json({ message: 'Vui lòng chọn đầy đủ thông tin' });
        }

        await User.updateRole(userId, roleId);

        res.json({ message: 'Cập nhật thành công! Vai trò mới đã được áp dụng.' });
    } catch (error) {
        console.error('Update role error:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

exports.getRoles = async (req, res) => {
    try {
        const roles = await User.getRoles();
        res.json(roles);
    } catch (error) {
        console.error('Get roles error:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};
