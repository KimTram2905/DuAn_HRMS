const db = require('../config/database');

class Employee {
    static async getAll(filters = {}) {
        let query = `
            SELECT nv.*, pb.TenPhongBan, cv.TenChucVu
            FROM NhanVien nv
            LEFT JOIN PhongBan pb ON nv.PhongBanID = pb.MaPhongBan
            LEFT JOIN ChucVu cv ON nv.ChucVuID = cv.MaChucVu
            WHERE 1=1
        `;
        const params = [];

        if (filters.search) {
            query += ' AND (nv.HoTen LIKE ? OR nv.MaNhanVien LIKE ?)';
            params.push(`%${filters.search}%`, `%${filters.search}%`);
        }

        if (filters.phongBan) {
            query += ' AND nv.PhongBanID = ?';
            params.push(filters.phongBan);
        }

        if (filters.phongBanId && filters.vaiTro === 'Manager') {
            query += ' AND nv.PhongBanID = ?';
            params.push(filters.phongBanId);
        }

        query += ' ORDER BY nv.MaNhanVien DESC';

        const [rows] = await db.query(query, params);
        return rows;
    }

    static async delete(id, userId) {
        await db.query(
            "UPDATE NhanVien SET TrangThai = 'NghiViec' WHERE MaNhanVien = ?",
            [id]
        );

        await db.query(
            `INSERT INTO LichSuThayDoi (NhanVienID, NguoiThucHienID, NoiDungThayDoi)
             VALUES (?, ?, ?)`,
            [id, userId, `Chuyển trạng thái sang Nghỉ việc`]
        );
    }
    static async getDepartments() {
    const [rows] = await db.query('SELECT * FROM PhongBan');
    return rows;
}
}

module.exports = Employee;