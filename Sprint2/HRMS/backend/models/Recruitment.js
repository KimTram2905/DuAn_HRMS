// models/Recruitment.js
const db = require('../config/database');

class Recruitment {
    // ===================== TIN TUYỂN DỤNG =====================
    
    // Lấy tất cả tin tuyển dụng (công khai cho Candidate)
    static async getAll(filters = {}) {
        let query = `
            SELECT tt.*, nd.TenDangNhap as NguoiDang
            FROM TinTuyenDung tt
            JOIN NguoiDung nd ON tt.NguoiDangID = nd.MaNguoiDung
            WHERE tt.HanNop >= CURDATE()
        `;
        const params = [];

        if (filters.search) {
            query += ' AND (tt.ViTri LIKE ? OR tt.MoTaCongViec LIKE ?)';
            params.push(`%${filters.search}%`, `%${filters.search}%`);
        }

        query += ' ORDER BY tt.MaTin DESC';

        const [rows] = await db.query(query, params);
        return rows;
    }

    // Lấy chi tiết tin tuyển dụng
    static async findById(id) {
        const [rows] = await db.query(
            `SELECT tt.*, nd.TenDangNhap as NguoiDang
             FROM TinTuyenDung tt
             JOIN NguoiDung nd ON tt.NguoiDangID = nd.MaNguoiDung
             WHERE tt.MaTin = ?`,
            [id]
        );
        return rows[0];
    }

    // Tạo tin tuyển dụng mới (Manager/Admin)
    static async create(jobData) {
        const { viTri, mucLuong, kinhNghiem, yeuCauKyNang, yeuCauBangCap, moTaCongViec, hanNop, nguoiDangID } = jobData;
        
        const [result] = await db.query(
            `INSERT INTO TinTuyenDung 
            (ViTri, MucLuong, KinhNghiem, YeuCauKyNang, YeuCauBangCap, MoTaCongViec, HanNop, NguoiDangID)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [viTri, mucLuong, kinhNghiem, yeuCauKyNang, yeuCauBangCap, moTaCongViec, hanNop, nguoiDangID]
        );
        return result.insertId;
    }

    // Cập nhật tin tuyển dụng
    static async update(id, jobData) {
        const { viTri, mucLuong, kinhNghiem, yeuCauKyNang, yeuCauBangCap, moTaCongViec, hanNop } = jobData;
        
        await db.query(
            `UPDATE TinTuyenDung SET
            ViTri = ?, MucLuong = ?, KinhNghiem = ?, YeuCauKyNang = ?,
            YeuCauBangCap = ?, MoTaCongViec = ?, HanNop = ?
            WHERE MaTin = ?`,
            [viTri, mucLuong, kinhNghiem, yeuCauKyNang, yeuCauBangCap, moTaCongViec, hanNop, id]
        );
    }

    // Xóa tin tuyển dụng
    static async delete(id) {
        // Kiểm tra có hồ sơ ứng tuyển không
        const [applications] = await db.query(
            'SELECT COUNT(*) as count FROM HoSoUngVien WHERE TinTuyenDungID = ?',
            [id]
        );
        
        if (applications[0].count > 0) {
            throw new Error('Không thể xóa tin có hồ sơ ứng tuyển');
        }

        await db.query('DELETE FROM TinTuyenDung WHERE MaTin = ?', [id]);
    }

    // ===================== HỒ SƠ ỨNG VIÊN =====================
    
    // Nộp hồ sơ ứng tuyển (Candidate)
    static async submitApplication(applicationData) {
        const { hoTen, email, soDienThoai, tinTuyenDungID, duongDanCV } = applicationData;
        
        // Tạo mã hồ sơ tự động (HS + timestamp)
        const timestamp = Date.now().toString();
        const shortTimestamp = timestamp.slice(-8); // Lấy 8 chữ số cuối
        const maHoSo = 'HS' + shortTimestamp; // Tổng cộng 10 ký tự: HS + 8 số
        
        const [result] = await db.query(
            `INSERT INTO HoSoUngVien 
            (MaHoSo, HoTen, Email, SoDienThoai, TinTuyenDungID, DuongDanCV)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [maHoSo, hoTen, email, soDienThoai, tinTuyenDungID, duongDanCV]
        );
        
        return maHoSo;
    }

    // Lấy danh sách hồ sơ theo tin tuyển dụng (Manager)
    static async getApplicationsByJob(jobId) {
        const [rows] = await db.query(
            `SELECT hs.*, tt.ViTri
             FROM HoSoUngVien hs
             JOIN TinTuyenDung tt ON hs.TinTuyenDungID = tt.MaTin
             WHERE hs.TinTuyenDungID = ?
             ORDER BY hs.NgayNop DESC`,
            [jobId]
        );
        return rows;
    }

    // Lấy tất cả hồ sơ ứng viên (Manager/Admin)
    static async getAllApplications(filters = {}) {
        let query = `
            SELECT hs.*, tt.ViTri, tt.MaTin
            FROM HoSoUngVien hs
            JOIN TinTuyenDung tt ON hs.TinTuyenDungID = tt.MaTin
            WHERE 1=1
        `;
        const params = [];

        if (filters.status) {
            query += ' AND hs.TrangThai = ?';
            params.push(filters.status);
        }

        if (filters.search) {
            query += ' AND (hs.HoTen LIKE ? OR hs.Email LIKE ? OR tt.ViTri LIKE ?)';
            params.push(`%${filters.search}%`, `%${filters.search}%`, `%${filters.search}%`);
        }

        query += ' ORDER BY hs.NgayNop DESC';

        const [rows] = await db.query(query, params);
        return rows;
    }

    // Lấy chi tiết hồ sơ ứng viên
    static async getApplicationById(id) {
        const [rows] = await db.query(
            `SELECT hs.*, tt.ViTri, tt.MoTaCongViec, tt.YeuCauKyNang, tt.YeuCauBangCap
             FROM HoSoUngVien hs
             JOIN TinTuyenDung tt ON hs.TinTuyenDungID = tt.MaTin
             WHERE hs.MaHoSo = ?`,
            [id]
        );
        return rows[0];
    }

    // Cập nhật trạng thái hồ sơ
    static async updateApplicationStatus(id, status) {
        await db.query(
            'UPDATE HoSoUngVien SET TrangThai = ? WHERE MaHoSo = ?',
            [status, id]
        );
    }

    // Thêm ghi chú cho hồ sơ
    static async addNote(noteData) {
        const { hoSoUngVienID, nguoiCapNhatID, noiDung } = noteData;
        
        await db.query(
            `INSERT INTO GhiChuUngVien (HoSoUngVienID, NguoiCapNhatID, NoiDung)
             VALUES (?, ?, ?)`,
            [hoSoUngVienID, nguoiCapNhatID, noiDung]
        );
    }

    // Lấy ghi chú của hồ sơ
    static async getNotesByApplication(applicationId) {
        const [rows] = await db.query(
            `SELECT gc.*, nd.TenDangNhap, nv.HoTen as NguoiCapNhat
             FROM GhiChuUngVien gc
             JOIN NguoiDung nd ON gc.NguoiCapNhatID = nd.MaNguoiDung
             LEFT JOIN NhanVien nv ON nd.MaNguoiDung = nv.NguoiDungID
             WHERE gc.HoSoUngVienID = ?
             ORDER BY gc.ThoiGian DESC`,
            [applicationId]
        );
        return rows;
    }

    // Lấy hồ sơ của ứng viên (theo email - cho Candidate xem hồ sơ của mình)
    static async getMyApplications(email) {
        const [rows] = await db.query(
            `SELECT hs.*, tt.ViTri, tt.MucLuong, tt.KinhNghiem
             FROM HoSoUngVien hs
             JOIN TinTuyenDung tt ON hs.TinTuyenDungID = tt.MaTin
             WHERE hs.Email = ?
             ORDER BY hs.NgayNop DESC`,
            [email]
        );
        return rows;
    }
}

module.exports = Recruitment;