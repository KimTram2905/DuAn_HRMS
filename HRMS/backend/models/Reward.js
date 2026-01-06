const db = require('../config/database');

class Reward {
    // Lấy danh sách thưởng/phạt cho phòng ban (dành cho Manager)
    static async getByDepartment(departmentId) {
        const [rows] = await db.query(
            `SELECT tp.*, nv.HoTen, nv.MaNhanVien, pb.TenPhongBan
             FROM ThuongPhat tp
             JOIN NhanVien nv ON tp.NhanVienID = nv.MaNhanVien
             JOIN PhongBan pb ON nv.PhongBanID = pb.MaPhongBan
             WHERE nv.PhongBanID = ? AND nv.TrangThai = 'ConLam'
             ORDER BY tp.Ngay DESC`,
            [departmentId]
        );
        return rows;
    }

    // Lấy tất cả thưởng/phạt (dành cho Admin, nếu cần mở rộng)
    static async getAll() {
        const [rows] = await db.query(
            `SELECT tp.*, nv.HoTen, nv.MaNhanVien, pb.TenPhongBan
             FROM ThuongPhat tp
             JOIN NhanVien nv ON tp.NhanVienID = nv.MaNhanVien
             JOIN PhongBan pb ON nv.PhongBanID = pb.MaPhongBan
             ORDER BY tp.Ngay DESC`
        );
        return rows;
    }

    // Thêm mới thưởng/phạt
    static async create(rewardData) {
        const { nhanVienID, loai, soTien, lyDo } = rewardData;
        const [result] = await db.query(
            `INSERT INTO ThuongPhat (NhanVienID, Loai, SoTien, LyDo, Ngay)
             VALUES (?, ?, ?, ?, NOW())`,
            [nhanVienID, loai, soTien, lyDo]
        );
        return result.insertId;
    }

    // Cập nhật thưởng/phạt
    static async update(id, rewardData) {
        const { nhanVienID, loai, soTien, lyDo } = rewardData;
        await db.query(
            `UPDATE ThuongPhat SET NhanVienID = ?, Loai = ?, SoTien = ?, LyDo = ?
             WHERE MaThuongPhat = ?`,
            [nhanVienID, loai, soTien, lyDo, id]
        );
    }

    // Xóa thưởng/phạt
    static async delete(id) {
        await db.query(`DELETE FROM ThuongPhat WHERE MaThuongPhat = ?`, [id]);
    }

    // Lấy chi tiết một thưởng/phạt
    static async findById(id) {
        const [rows] = await db.query(
            `SELECT tp.*, nv.HoTen, nv.MaNhanVien, pb.TenPhongBan
             FROM ThuongPhat tp
             JOIN NhanVien nv ON tp.NhanVienID = nv.MaNhanVien
             JOIN PhongBan pb ON nv.PhongBanID = pb.MaPhongBan
             WHERE tp.MaThuongPhat = ?`,
            [id]
        );
        return rows[0];
    }
}

module.exports = Reward;