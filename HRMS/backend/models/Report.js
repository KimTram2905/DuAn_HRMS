// models/Report.js
const db = require('../config/database');

class Report {
    // ===================== U5.1 - BÁO CÁO NHÂN SỰ =====================
    
    // Lấy thống kê nhân viên theo phòng ban
    static async getEmployeeReport(filters = {}) {
        const { phongBan, month, year } = filters;
        
        let query = `
            SELECT 
                pb.TenPhongBan,
                COUNT(nv.MaNhanVien) as SoNhanVien,
                SUM(CASE WHEN nv.GioiTinh = 'Nam' THEN 1 ELSE 0 END) as SoNam,
                SUM(CASE WHEN nv.GioiTinh = 'Nu' THEN 1 ELSE 0 END) as SoNu,
                ROUND(AVG(TIMESTAMPDIFF(YEAR, nv.NgaySinh, CURDATE())), 1) as DoTuoiTrungBinh
            FROM PhongBan pb
            LEFT JOIN NhanVien nv ON pb.MaPhongBan = nv.PhongBanID 
                AND nv.TrangThai = 'ConLam'
        `;
        const params = [];

        // Nếu có tháng/năm, lọc nhân viên đã làm việc trong khoảng thời gian đó
        if (month && year) {
            query += ` AND nv.NgayBatDauHopDong <= LAST_DAY(STR_TO_DATE(CONCAT(?, '-', ?, '-01'), '%Y-%m-%d'))`;
            params.push(year, month);
        }

        if (phongBan) {
            query += ' WHERE pb.MaPhongBan = ?';
            params.push(phongBan);
        }

        query += ' GROUP BY pb.MaPhongBan, pb.TenPhongBan ORDER BY pb.TenPhongBan';

        const [rows] = await db.query(query, params);
        return rows;
    }

    // ===================== U5.2 - BÁO CÁO CHẤM CÔNG =====================
    
    // Lấy báo cáo chấm công theo phòng ban
    static async getAttendanceReport(filters = {}) {
        const { phongBan, month, year } = filters;

        if (!phongBan || !month || !year) {
            throw new Error('Vui lòng chọn phòng ban, tháng và năm');
        }

        const query = `
            SELECT 
                nv.MaNhanVien,
                nv.HoTen as NhanVien,
                COALESCE(SUM(cc.TongGioLam), 0) as TongGioLam,
                COALESCE(COUNT(DISTINCT np.MaNghiPhep), 0) as NgayNghi,
                COALESCE(SUM(CASE WHEN cc.DenMuon > 0 THEN 1 ELSE 0 END), 0) as DiMuon
            FROM NhanVien nv
            LEFT JOIN ChamCong cc ON nv.MaNhanVien = cc.NhanVienID 
                AND MONTH(cc.Ngay) = ? AND YEAR(cc.Ngay) = ?
            LEFT JOIN NghiPhep np ON nv.MaNhanVien = np.NhanVienID 
                AND np.TrangThai = 'DaDuyet'
                AND MONTH(np.NgayBatDau) = ? AND YEAR(np.NgayBatDau) = ?
            WHERE nv.PhongBanID = ? AND nv.TrangThai = 'ConLam'
            GROUP BY nv.MaNhanVien, nv.HoTen
            ORDER BY nv.HoTen
        `;

        const [rows] = await db.query(query, [month, year, month, year, phongBan]);
        return rows;
    }

    // ===================== U5.3 - BÁO CÁO LƯƠNG =====================
    
    // Lấy báo cáo lương theo phòng ban
    static async getSalaryReport(filters = {}) {
        const { phongBan, month, year } = filters;

        if (!month || !year) {
            throw new Error('Vui lòng chọn tháng và năm');
        }

        let query = `
            SELECT 
                pb.TenPhongBan,
                COALESCE(SUM(bl.TongThuNhap), 0) as TongQuyLuong
            FROM PhongBan pb
            LEFT JOIN NhanVien nv ON pb.MaPhongBan = nv.PhongBanID
            LEFT JOIN BangLuong bl ON nv.MaNhanVien = bl.NhanVienID 
                AND bl.Thang = ? AND bl.Nam = ?
        `;
        const params = [month, year];

        if (phongBan) {
            query += ' WHERE pb.MaPhongBan = ?';
            params.push(phongBan);
        }

        query += ' GROUP BY pb.MaPhongBan, pb.TenPhongBan ORDER BY pb.TenPhongBan';

        const [rows] = await db.query(query, params);

        // Lấy dữ liệu tháng trước để so sánh
        const prevMonth = month === 1 ? 12 : month - 1;
        const prevYear = month === 1 ? year - 1 : year;

        let prevQuery = `
            SELECT 
                pb.MaPhongBan,
                COALESCE(SUM(bl.TongThuNhap), 0) as TongQuyLuong
            FROM PhongBan pb
            LEFT JOIN NhanVien nv ON pb.MaPhongBan = nv.PhongBanID
            LEFT JOIN BangLuong bl ON nv.MaNhanVien = bl.NhanVienID 
                AND bl.Thang = ? AND bl.Nam = ?
        `;
        const prevParams = [prevMonth, prevYear];

        if (phongBan) {
            prevQuery += ' WHERE pb.MaPhongBan = ?';
            prevParams.push(phongBan);
        }

        prevQuery += ' GROUP BY pb.MaPhongBan';

        const [prevRows] = await db.query(prevQuery, prevParams);
        
        // Map dữ liệu tháng trước
        const prevDataMap = {};
        prevRows.forEach(row => {
            prevDataMap[row.MaPhongBan] = row.TongQuyLuong;
        });

        // Tính % thay đổi
        const result = rows.map(row => {
            const prevSalary = prevDataMap[row.MaPhongBan] || 0;
            let changePercent = 0;
            
            if (prevSalary > 0) {
                changePercent = ((row.TongQuyLuong - prevSalary) / prevSalary * 100).toFixed(2);
            }

            return {
                ...row,
                SoVoiThangTruoc: parseFloat(changePercent)
            };
        });

        return result;
    }

    // ===================== LƯU LỊCH SỬ BÁO CÁO =====================
    
    static async saveReportHistory(reportData) {
        const { loaiBaoCao, nguoiTaoID, duongDanFile } = reportData;
        
        const [result] = await db.query(
            `INSERT INTO BaoCao (LoaiBaoCao, NguoiTaoID, DuongDanFile)
             VALUES (?, ?, ?)`,
            [loaiBaoCao, nguoiTaoID, duongDanFile]
        );
        
        return result.insertId;
    }

    // Lấy lịch sử báo cáo
    static async getReportHistory(filters = {}) {
        const { loaiBaoCao } = filters;
        
        let query = `
            SELECT bc.*, nd.TenDangNhap as NguoiTao
            FROM BaoCao bc
            JOIN NguoiDung nd ON bc.NguoiTaoID = nd.MaNguoiDung
            WHERE 1=1
        `;
        const params = [];

        if (loaiBaoCao) {
            query += ' AND bc.LoaiBaoCao = ?';
            params.push(loaiBaoCao);
        }

        query += ' ORDER BY bc.NgayTao DESC LIMIT 50';

        const [rows] = await db.query(query, params);
        return rows;
    }
}

module.exports = Report;