const db = require('../config/database');
const bcrypt = require('bcrypt');

class User {
    static async findByUsername(username) {
        const [rows] = await db.query(
            `SELECT nd.*, vt.TenVaiTro as vaiTro, nv.MaNhanVien, nv.HoTen, nv.PhongBanID
             FROM NguoiDung nd
             JOIN VaiTro vt ON nd.VaiTroID = vt.MaVaiTro
             LEFT JOIN NhanVien nv ON nd.MaNguoiDung = nv.NguoiDungID
             WHERE nd.TenDangNhap = ?`,
            [username]
        );
        return rows[0];
    }

    static async findByEmail(email) {
        const [rows] = await db.query(
            'SELECT * FROM NguoiDung WHERE Email = ?',
            [email]
        );
        return rows[0];
    }

    static async comparePassword(password, hash) {
        return await bcrypt.compare(password, hash);
    }

    static async updatePassword(userId, newPassword) {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await db.query(
            'UPDATE NguoiDung SET MatKhau = ? WHERE MaNguoiDung = ?',
            [hashedPassword, userId]
        );
    }

    static async createPasswordResetToken(email) {
        const user = await this.findByEmail(email);
        if (!user) return null;

        const token = require('crypto').randomBytes(32).toString('hex');
        const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 giờ

        await db.query(
            'INSERT INTO KhoiPhucMatKhau (NguoiDungID, Token, ThoiGianHetHan) VALUES (?, ?, ?)',
            [user.MaNguoiDung, token, expiry]
        );

        return { token, user };
    }

    static async verifyResetToken(token) {
        const [rows] = await db.query(
            `SELECT kp.*, nd.Email 
             FROM KhoiPhucMatKhau kp
             JOIN NguoiDung nd ON kp.NguoiDungID = nd.MaNguoiDung
             WHERE kp.Token = ? AND kp.TrangThai = 'DangSuDung' AND kp.ThoiGianHetHan > NOW()`,
            [token]
        );
        return rows[0];
    }

    static async invalidateResetToken(token) {
        await db.query(
            "UPDATE KhoiPhucMatKhau SET TrangThai = 'HetHan' WHERE Token = ?",
            [token]
        );
    }

    static async getAllUsers() {
        const [rows] = await db.query(
            `SELECT nd.MaNguoiDung, nv.HoTen as TenNhanVien, nd.Email, 
                    pb.TenPhongBan as PhongBan, vt.TenVaiTro as VaiTro
             FROM NguoiDung nd
             LEFT JOIN NhanVien nv ON nd.MaNguoiDung = nv.NguoiDungID
             LEFT JOIN PhongBan pb ON nv.PhongBanID = pb.MaPhongBan
             JOIN VaiTro vt ON nd.VaiTroID = vt.MaVaiTro
             ORDER BY nd.MaNguoiDung`
        );
        return rows;
    }

    static async updateRole(userId, roleId) {
        await db.query(
            'UPDATE NguoiDung SET VaiTroID = ? WHERE MaNguoiDung = ?',
            [roleId, userId]
        );
    }

    static async getRoles() {
        const [rows] = await db.query('SELECT * FROM VaiTro');
        return rows;
    }

    // Thêm vào class User
static async register(userData) {
    const { username, email, password, hoTen, soDienThoai } = userData;
    
    // Kiểm tra email đã tồn tại
    const emailExists = await this.findByEmail(email);
    if (emailExists) {
        throw new Error('Email đã tồn tại trong hệ thống');
    }

    // Kiểm tra username đã tồn tại
    const usernameExists = await this.findByUsername(username);
    if (usernameExists) {
        throw new Error('Tên đăng nhập đã tồn tại');
    }

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Tìm vai trò "Ứng viên" (cần có trong database)
    const [role] = await db.query(
        'SELECT MaVaiTro FROM VaiTro WHERE TenVaiTro = ?',
        ['Candidate']
    );
    
    if (!role.length) {
        throw new Error('Vai trợ Candidate không tồn tại trong hệ thống');
    }

    // Tạo người dùng với vai trò Candidate
    const [userResult] = await db.query(
        'INSERT INTO NguoiDung (TenDangNhap, MatKhau, Email, VaiTroID) VALUES (?, ?, ?, ?)',
        [username, hashedPassword, email, role[0].MaVaiTro]
    );
    
    const userId = userResult.insertId;

    return {
        userId,
        username,
        email,
        hoTen,
        soDienThoai,
        vaiTro: 'Candidate'
    };
}
}

module.exports = User;