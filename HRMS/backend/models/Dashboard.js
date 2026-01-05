const db = require('../config/database');

class Dashboard {
    static async getStats(filters = {}) {
        const { phongBan } = filters;

        let queryNV = "SELECT COUNT(*) as total FROM NhanVien WHERE TrangThai = 'ConLam'";
        const paramsNV = [];
        if (phongBan) { queryNV += ' AND PhongBanID = ?'; paramsNV.push(phongBan); }
        const [totalEmployees] = await db.query(queryNV, paramsNV);

        let queryLuong = 'SELECT SUM(TongThuNhap) as total FROM BangLuong WHERE 1=1';
        const paramsLuong = [];
        if (phongBan) { queryLuong += ' AND NhanVienID IN (SELECT MaNhanVien FROM NhanVien WHERE PhongBanID = ?)'; paramsLuong.push(phongBan); }
        const [totalSalary] = await db.query(queryLuong, paramsLuong);

        let queryNghi = `
            SELECT COUNT(*) as total
            FROM NghiPhep np
            JOIN NhanVien nv ON np.NhanVienID = nv.MaNhanVien
            WHERE np.TrangThai = 'DaDuyet'
        `;
        const paramsNghi = [];
        if (phongBan) { queryNghi += ' AND nv.PhongBanID = ?'; paramsNghi.push(phongBan); }
        const [totalLeave] = await db.query(queryNghi, paramsNghi);

        return {
            totalEmployees: totalEmployees[0].total || 0,
            totalSalary: totalSalary[0].total || 0,
            totalLeave: totalLeave[0].total || 0,
        };
    }

    static async getEmployeesByDepartment(filters = {}) {
        const { phongBan } = filters;
        let query = `
            SELECT pb.TenPhongBan, COUNT(nv.MaNhanVien) as SoLuong
            FROM PhongBan pb
            LEFT JOIN NhanVien nv ON pb.MaPhongBan = nv.PhongBanID AND nv.TrangThai = 'ConLam'
        `;
        const params = [];
        if (phongBan) { query += ' WHERE pb.MaPhongBan = ?'; params.push(phongBan); }
        query += ' GROUP BY pb.MaPhongBan, pb.TenPhongBan';
        const [rows] = await db.query(query, params);
        return rows;
    }

    static async getEmployeesByRole() {
        const [rows] = await db.query(`
            SELECT vt.TenVaiTro, COUNT(nd.MaNguoiDung) as SoLuong
            FROM VaiTro vt
            LEFT JOIN NguoiDung nd ON vt.MaVaiTro = nd.VaiTroID
            GROUP BY vt.MaVaiTro, vt.TenVaiTro
        `);
        return rows;
    }

    static async getNewEmployees(filters = {}) {
        const { phongBan } = filters;
        let query = 'SELECT nv.*, pb.TenPhongBan FROM NhanVien nv JOIN PhongBan pb ON nv.PhongBanID = pb.MaPhongBan WHERE 1=1';
        const params = [];
        if (phongBan) { query += ' AND nv.PhongBanID = ?'; params.push(phongBan); }
        query += ' ORDER BY nv.NgayBatDauHopDong DESC LIMIT 5';
        const [rows] = await db.query(query, params);
        return rows;
    }

    static async getAttendanceByDepartment(filters = {}) {
        const { phongBan } = filters;
        let query = `
            SELECT pb.TenPhongBan,
                   SUM(cc.TongGioLam) as TongGioLam,
                   SUM(cc.DenMuon) as SoLanMuon
            FROM PhongBan pb
            LEFT JOIN NhanVien nv ON pb.MaPhongBan = nv.PhongBanID
            LEFT JOIN ChamCong cc ON nv.MaNhanVien = cc.NhanVienID
            WHERE 1=1
        `;
        const params = [];
        if (phongBan) { query += ' AND pb.MaPhongBan = ?'; params.push(phongBan); }
        query += ' GROUP BY pb.MaPhongBan, pb.TenPhongBan ORDER BY pb.TenPhongBan';
        const [rows] = await db.query(query, params);
        return rows;
    }
}

module.exports = Dashboard;
