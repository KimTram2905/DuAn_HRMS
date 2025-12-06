const db = require('../config/database');

class Attendance {
    static async getByEmployeeId(employeeId, month, year) {
        const [rows] = await db.query(
            `SELECT * FROM ChamCong 
             WHERE NhanVienID = ? AND MONTH(Ngay) = ? AND YEAR(Ngay) = ?
             ORDER BY Ngay ASC`,
            [employeeId, month, year]
        );
        return rows;
    }

    static async getLeaveDays(employeeId, month, year) {
        const [rows] = await db.query(
            `SELECT NgayBatDau, NgayKetThuc, LoaiNghi 
             FROM NghiPhep 
             WHERE NhanVienID = ? AND TrangThai = 'DaDuyet' 
             AND ((MONTH(NgayBatDau) = ? AND YEAR(NgayBatDau) = ?) 
                  OR (MONTH(NgayKetThuc) = ? AND YEAR(NgayKetThuc) = ?))`,
            [employeeId, month, year, month, year, month, year]
        );
        return rows;
    }

    static async create(attendanceData) {
        const { nhanVienID, ngay, gioVao, gioRa } = attendanceData;
        const tongGioLam = this.calculateHours(gioVao, gioRa);
        const denMuon = this.calculateLateMinutes(gioVao);
        const veSom = this.calculateEarlyMinutes(gioRa);

        const [result] = await db.query(
            `INSERT INTO ChamCong (NhanVienID, Ngay, GioVao, GioRa, TongGioLam, DenMuon, VeSom) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [nhanVienID, ngay, gioVao, gioRa, tongGioLam, denMuon, veSom]
        );
        return result.insertId;
    }

    static calculateHours(gioVao, gioRa) {
        if (!gioVao || !gioRa) return 0;
        const start = new Date(`1970-01-01T${gioVao}`);
        const end = new Date(`1970-01-01T${gioRa}`);
        return (end - start) / (1000 * 60 * 60); // Giờ
    }

    static calculateLateMinutes(gioVao) {
        if (!gioVao) return 0;
        const standardStart = new Date('1970-01-01T08:00:00');
        const actualStart = new Date(`1970-01-01T${gioVao}`);
        return actualStart > standardStart ? (actualStart - standardStart) / (1000 * 60) : 0;
    }

    static calculateEarlyMinutes(gioRa) {
        if (!gioRa) return 0;
        const standardEnd = new Date('1970-01-01T17:00:00');
        const actualEnd = new Date(`1970-01-01T${gioRa}`);
        return actualEnd < standardEnd ? (standardEnd - actualEnd) / (1000 * 60) : 0;
    }
    // Thêm method mới cho khoảng thời gian
static async getByDateRange(employeeId, startDate, endDate) {
    const [rows] = await db.query(
        `SELECT * FROM ChamCong 
         WHERE NhanVienID = ? AND Ngay BETWEEN ? AND ?
         ORDER BY Ngay ASC`,
        [employeeId, startDate, endDate]
    );
    return rows;
}

static async getLeaveDaysByDateRange(employeeId, startDate, endDate) {
    const [rows] = await db.query(
        `SELECT NgayBatDau, NgayKetThuc, LoaiNghi 
         FROM NghiPhep 
         WHERE NhanVienID = ? AND TrangThai = 'DaDuyet' 
         AND ((NgayBatDau BETWEEN ? AND ?) OR (NgayKetThuc BETWEEN ? AND ?))`,
        [employeeId, startDate, endDate, startDate, endDate]
    );
    return rows;
}

//PHẦN CỦA PHẤN
// ===================== MANAGEMENT METHODS =====================
static async getByMonthManagement(filters = {}) {
    const { phongBan, month, year } = filters;
    
    let query = `
        SELECT cc.*, nv.HoTen, nv.MaNhanVien, pb.TenPhongBan
        FROM ChamCong cc
        JOIN NhanVien nv ON cc.NhanVienID = nv.MaNhanVien
        JOIN PhongBan pb ON nv.PhongBanID = pb.MaPhongBan
        WHERE MONTH(cc.Ngay) = ? AND YEAR(cc.Ngay) = ?
    `;
    const params = [month, year];

    if (phongBan) {
        query += ' AND nv.PhongBanID = ?';
        params.push(phongBan);
    }

    query += ' ORDER BY cc.Ngay DESC, nv.HoTen ASC';

    const [rows] = await db.query(query, params);
    return rows;
}

static async getByDateRangeManagement(filters = {}) {
    const { phongBan, startDate, endDate } = filters;
    
    let query = `
        SELECT cc.*, nv.HoTen, nv.MaNhanVien, pb.TenPhongBan
        FROM ChamCong cc
        JOIN NhanVien nv ON cc.NhanVienID = nv.MaNhanVien
        JOIN PhongBan pb ON nv.PhongBanID = pb.MaPhongBan
        WHERE cc.Ngay BETWEEN ? AND ?
    `;
    const params = [startDate, endDate];

    if (phongBan) {
        query += ' AND nv.PhongBanID = ?';
        params.push(phongBan);
    }

    query += ' ORDER BY cc.Ngay DESC, nv.HoTen ASC';

    const [rows] = await db.query(query, params);
    return rows;
}

static async checkEmployeeDepartment(employeeId, departmentId) {
    const [rows] = await db.query(
        'SELECT MaNhanVien FROM NhanVien WHERE MaNhanVien = ? AND PhongBanID = ?',
        [employeeId, departmentId]
    );
    return rows[0];
}

static async checkExisting(employeeId, date) {
    const [rows] = await db.query(
        'SELECT MaChamCong FROM ChamCong WHERE NhanVienID = ? AND DATE(Ngay) = DATE(?)',
        [employeeId, date]
    );
    return rows[0];
}
// ===================== CRUD METHODS =====================
static async findById(id) {
    const [rows] = await db.query(
        `SELECT cc.*, nv.HoTen, nv.MaNhanVien, pb.TenPhongBan, nv.PhongBanID
         FROM ChamCong cc
         JOIN NhanVien nv ON cc.NhanVienID = nv.MaNhanVien
         JOIN PhongBan pb ON nv.PhongBanID = pb.MaPhongBan
         WHERE cc.MaChamCong = ?`,
        [id]
    );
    return rows[0];
}

static async update(id, attendanceData) {
    const { gioVao, gioRa } = attendanceData;
    const tongGioLam = this.calculateHours(gioVao, gioRa);
    const denMuon = this.calculateLateMinutes(gioVao);
    const veSom = this.calculateEarlyMinutes(gioRa);

    await db.query(
        `UPDATE ChamCong SET 
         GioVao = ?, GioRa = ?, TongGioLam = ?, DenMuon = ?, VeSom = ?
         WHERE MaChamCong = ?`,
        [gioVao, gioRa, tongGioLam, denMuon, veSom, id]
    );
}

static async delete(id) {
    await db.query('DELETE FROM ChamCong WHERE MaChamCong = ?', [id]);
}
   // Attendance.js
   // Thêm method này vào cuối class Attendance
   static async createLeaveAttendance(nhanVienID, ngay) {
       // Kiểm tra đã có bản ghi chấm công cho ngày này chưa
       const existing = await this.checkExisting(nhanVienID, ngay);
       if (existing) {
           console.log(`Bản ghi chấm công đã tồn tại cho nhân viên ${nhanVienID} vào ngày ${ngay}`);
           return; // Không tạo mới
       }

       // Tạo bản ghi chấm công cho ngày nghỉ (TongGioLam = 0, đánh dấu nghỉ phép)
       const attendanceData = {
           nhanVienID,
           ngay,
           gioVao: null, // Không có giờ vào/ra cho ngày nghỉ
           gioRa: null
       };
       const result = await this.create(attendanceData);
       console.log(`Đã tạo bản ghi chấm công nghỉ phép cho nhân viên ${nhanVienID} vào ngày ${ngay}`);
       return result;
   }
   
}

module.exports = Attendance;