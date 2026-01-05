const db = require('../config/database');

class EditRequest {
    static async create(employeeId, requestData) {
        const { fieldName, currentValue, newValue, reason } = requestData;
        
        const [result] = await db.query(
            `INSERT INTO YeuCauChinhSua 
            (NhanVienID, TenTruong, GiaTriHienTai, GiaTriMoi, LyDo, TrangThai, NgayTao)
            VALUES (?, ?, ?, ?, ?, 'DangCho', NOW())`,
            [employeeId, fieldName, currentValue, newValue, reason]
        );

        return result.insertId;
    }

    static async getByEmployeeId(employeeId) {
        const [rows] = await db.query(
            `SELECT * FROM YeuCauChinhSua 
             WHERE NhanVienID = ? 
             ORDER BY NgayTao DESC`,
            [employeeId]
        );
        return rows;
    }

    static async notifyAdmins(employeeId, requestId) {
        // Lấy thông tin nhân viên
        const [employee] = await db.query(
            'SELECT HoTen, Email FROM NhanVien WHERE MaNhanVien = ?',
            [employeeId]
        );

        // Lấy danh sách admin
        const [admins] = await db.query(
            `SELECT nd.Email, nv.HoTen 
             FROM NguoiDung nd
             JOIN VaiTro vt ON nd.VaiTroID = vt.MaVaiTro
             LEFT JOIN NhanVien nv ON nd.MaNguoiDung = nv.NguoiDungID
             WHERE vt.TenVaiTro = 'Admin'`
        );

        // Trong thực tế, gửi email hoặc thông báo trong ứng dụng
        console.log(`Thông báo đến ${admins.length} admin về yêu cầu #${requestId} từ ${employee[0].HoTen}`);
        
        return { employee: employee[0], admins };
    }
}

module.exports = EditRequest;