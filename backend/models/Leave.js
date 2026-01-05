const db = require('../config/database');

class Leave {
    static async create(leaveData) {
        const { nhanVienID, loaiNghi, ngayBatDau, ngayKetThuc, lyDo } = leaveData;
        const soNgay = this.calculateDays(ngayBatDau, ngayKetThuc);

        const [result] = await db.query(
            `INSERT INTO NghiPhep (NhanVienID, LoaiNghi, NgayBatDau, NgayKetThuc, SoNgay, LyDo) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [nhanVienID, loaiNghi, ngayBatDau, ngayKetThuc, soNgay, lyDo]
        );
        return result.insertId;
    }

    static async getByEmployeeId(employeeId) {
        const [rows] = await db.query(
            `SELECT * FROM NghiPhep WHERE NhanVienID = ? ORDER BY NgayTao DESC`,
            [employeeId]
        );
        return rows;
    }

    static async checkConflict(employeeId, ngayBatDau, ngayKetThuc) {
        const [rows] = await db.query(
            `SELECT * FROM NghiPhep 
             WHERE NhanVienID = ? AND TrangThai != 'TuChoi' 
             AND ((NgayBatDau <= ? AND NgayKetThuc >= ?) OR (NgayBatDau <= ? AND NgayKetThuc >= ?))`,
            [employeeId, ngayKetThuc, ngayBatDau, ngayBatDau, ngayKetThuc]
        );
        return rows.length > 0;
    }

    static calculateDays(start, end) {
        const startDate = new Date(start);
        const endDate = new Date(end);
        return Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
    }

    static async notifyApprovers(requestId) {
        // Logic gửi thông báo (email hoặc in-app notification)
        console.log(`Thông báo yêu cầu nghỉ phép #${requestId} đã được gửi đến quản lý.`);
    }
}

module.exports = Leave;