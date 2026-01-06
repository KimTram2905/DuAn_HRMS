const User = require('../models/User');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin' });
        }

        const user = await User.findByUsername(username);

        if (!user) {
            return res.status(401).json({ message: 'Sai thông tin đăng nhập' });
        }

        const isValidPassword = await User.comparePassword(password, user.MatKhau);

        if (!isValidPassword) {
            return res.status(401).json({ message: 'Sai thông tin đăng nhập' });
        }

        const token = jwt.sign(
            {
                id: user.MaNguoiDung,
                username: user.TenDangNhap,
                vaiTro: user.vaiTro,
                maNhanVien: user.MaNhanVien,
                phongBanId: user.PhongBanID,
                email: user.Email
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Đăng nhập thành công',
            token,
            user: {
                id: user.MaNguoiDung,
                username: user.TenDangNhap,
                email: user.Email,
                vaiTro: user.vaiTro,
                hoTen: user.HoTen,
                maNhanVien: user.MaNhanVien
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Vui lòng nhập email' });
        }

        const result = await User.createPasswordResetToken(email);

        if (!result) {
            return res.status(404).json({ message: 'Email không tồn tại' });
        }

        // Trong thực tế, gửi email chứa link reset
        // Ở đây chỉ trả về token để test
        console.log('Reset token:', result.token);

        res.json({
            message: 'Email khôi phục mật khẩu đã được gửi',
            // Chỉ để test, production không trả về token
            resetToken: result.token
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { token, newPassword, confirmPassword } = req.body;

        if (!token || !newPassword || !confirmPassword) {
            return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin' });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: 'Mật khẩu xác nhận không khớp' });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 8 ký tự' });
        }

        const resetData = await User.verifyResetToken(token);

        if (!resetData) {
            return res.status(400).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
        }

        await User.updatePassword(resetData.NguoiDungID, newPassword);
        await User.invalidateResetToken(token);

        res.json({ message: 'Đặt lại mật khẩu thành công' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

exports.logout = async (req, res) => {
    try {
        // Trong thực tế có thể blacklist token
        res.json({ message: 'Đăng xuất thành công' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

exports.register = async (req, res) => {
    try {
        const { username, email, password, confirmPassword, hoTen, soDienThoai } = req.body;

        // Validation
        if (!username || !email || !password || !confirmPassword || !hoTen || !soDienThoai) {
            return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin' });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ message: 'Mật khẩu xác nhận không khớp' });
        }

        if (password.length < 8) {
            return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 8 ký tự' });
        }

        // Kiểm tra định dạng email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Email không hợp lệ' });
        }

        // Kiểm tra định dạng số điện thoại
        const phoneRegex = /^0\d{9,10}$/;
        if (!phoneRegex.test(soDienThoai)) {
            return res.status(400).json({ message: 'Số điện thoại không hợp lệ (10-11 số, bắt đầu bằng 0)' });
        }

        const result = await User.register({
            username,
            email,
            password,
            hoTen,
            soDienThoai
        });

        // Tạo token JWT
        const token = jwt.sign(
            {
                id: result.userId,
                username: result.username,
                email: result.email,
                hoTen: result.hoTen,
                vaiTro: result.vaiTro
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: 'Đăng ký tài khoản ứng viên thành công',
            token,
            user: {
                id: result.userId,
                username: result.username,
                email: result.email,
                hoTen: result.hoTen,
                vaiTro: result.vaiTro,
                soDienThoai: result.soDienThoai
            }
        });

    } catch (error) {
        console.error('Register error:', error);
        
        if (error.message.includes('đã tồn tại') || error.message.includes('không tồn tại')) {
            return res.status(400).json({ message: error.message });
        }
        
        res.status(500).json({ message: 'Lỗi server' });
    }
};