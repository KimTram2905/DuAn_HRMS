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

// ... (giữ nguyên getAll, delete, getDepartments từ Thành viên 5-2)

static async create(employeeData) {
    const {
        hoTen, ngaySinh, diaChi, soDienThoai, email, gioiTinh,
        phongBanID, chucVuID, loaiHopDong, ngayBatDauHopDong,
        ngayKetThucHopDong, luongCoBan, anhDaiDien
    } = employeeData;

    const [result] = await db.query(
        `INSERT INTO NhanVien 
        (HoTen, NgaySinh, DiaChi, SoDienThoai, Email, GioiTinh, PhongBanID, 
         ChucVuID, LoaiHopDong, NgayBatDauHopDong, NgayKetThucHopDong, 
         LuongCoBan, AnhDaiDien, TrangThai)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ConLam')`,
        [hoTen, ngaySinh, diaChi, soDienThoai, email, gioiTinh, phongBanID,
         chucVuID, loaiHopDong, ngayBatDauHopDong, ngayKetThucHopDong,
         luongCoBan, anhDaiDien]
    );

    return result.insertId;
}

static async update(id, employeeData, userId) {
    const {
        hoTen, ngaySinh, diaChi, soDienThoai, email, gioiTinh,
        phongBanID, chucVuID, loaiHopDong, ngayBatDauHopDong,
        ngayKetThucHopDong, luongCoBan, anhDaiDien
    } = employeeData;

    await db.query(
        `UPDATE NhanVien SET
        HoTen = ?, NgaySinh = ?, DiaChi = ?, SoDienThoai = ?, Email = ?,
        GioiTinh = ?, PhongBanID = ?, ChucVuID = ?, LoaiHopDong = ?,
        NgayBatDauHopDong = ?, NgayKetThucHopDong = ?, LuongCoBan = ?,
        AnhDaiDien = ?
        WHERE MaNhanVien = ?`,
        [hoTen, ngaySinh, diaChi, soDienThoai, email, gioiTinh, phongBanID,
         chucVuID, loaiHopDong, ngayBatDauHopDong, ngayKetThucHopDong,
         luongCoBan, anhDaiDien, id]
    );

    // Ghi log lịch sử thay đổi
    await db.query(
        `INSERT INTO LichSuThayDoi (NhanVienID, NguoiThucHienID, NoiDungThayDoi)
         VALUES (?, ?, ?)`,
        [id, userId, `Cập nhật thông tin nhân viên`]
    );
}

static async checkEmailExists(email, excludeId = null) {
    let query = 'SELECT MaNhanVien FROM NhanVien WHERE Email = ?';
    const params = [email];

    if (excludeId) {
        query += ' AND MaNhanVien != ?';
        params.push(excludeId);
    }

    const [rows] = await db.query(query, params);
    return rows.length > 0;
}

static async checkPhoneExists(phone, excludeId = null) {
    let query = 'SELECT MaNhanVien FROM NhanVien WHERE SoDienThoai = ?';
    const params = [phone];

    if (excludeId) {
        query += ' AND MaNhanVien != ?';
        params.push(excludeId);
    }

    const [rows] = await db.query(query, params);
    return rows.length > 0;
}

static async findById(id) {
        const [rows] = await db.query(
            `SELECT nv.*, pb.TenPhongBan, cv.TenChucVu, nd.Email as EmailNguoiDung
             FROM NhanVien nv
             LEFT JOIN PhongBan pb ON nv.PhongBanID = pb.MaPhongBan
             LEFT JOIN ChucVu cv ON nv.ChucVuID = cv.MaChucVu
             LEFT JOIN NguoiDung nd ON nv.NguoiDungID = nd.MaNguoiDung
             WHERE nv.MaNhanVien = ?`,
            [id]
        );
        return rows[0];
    }

    static async getPositions() {
        const [rows] = await db.query('SELECT * FROM ChucVu');
        return rows;
    }
}

module.exports = Employee;