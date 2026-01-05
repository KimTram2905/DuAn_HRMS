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
}

module.exports = Attendance;