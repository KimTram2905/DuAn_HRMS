const db = require('../config/database');

class Salary {
    // Tính lương hàng tháng cho một nhân viên (dựa trên chấm công, nghỉ phép, thưởng/phạt)
    static async calculateMonthlySalary(employeeId, month, year) {
        // Lấy thông tin nhân viên
        const [employeeRows] = await db.query(
            'SELECT LuongCoBan, TrangThai FROM NhanVien WHERE MaNhanVien = ?',
            [employeeId]
        );
        if (employeeRows.length === 0) throw new Error('Nhân viên không tồn tại');
        const { LuongCoBan: baseSalary, TrangThai: status } = employeeRows[0];

        // Nếu nghỉ việc, không tính lương
        if (status === 'NghiViec') {
            return {
                baseSalary: 0,
                actualWorkingDays: 0,
                grossSalary: 0,
                totalReward: 0,
                totalPenalty: 0,
                totalDeductions: 0,
                netSalary: 0,
                note: 'Nhân viên đã nghỉ việc'
            };
        }

        // Tính ngày công từ ChamCong
        const [attendanceRows] = await db.query(
            'SELECT SUM(TongGioLam) as totalHours, SUM(CASE WHEN DenMuon > 30 THEN 0.5 ELSE 0 END) as lateDays FROM ChamCong WHERE NhanVienID = ? AND MONTH(Ngay) = ? AND YEAR(Ngay) = ?',
            [employeeId, month, year]
        );
        const totalHours = attendanceRows[0].totalHours || 0;
        const lateDays = attendanceRows[0].lateDays || 0;
        const workingDaysFromAttendance = Math.max(0, Math.floor(totalHours / 8) - lateDays);

        // Tính ngày nghỉ phép có lương
        const [leaveRows] = await db.query(
            'SELECT SUM(SoNgay) as paidLeaveDays FROM NghiPhep WHERE NhanVienID = ? AND TrangThai = "DaDuyet" AND LoaiNghi IN ("PhepNam", "Om") AND MONTH(NgayBatDau) = ? AND YEAR(NgayBatDau) = ?',
            [employeeId, month, year]
        );
        const paidLeaveDays = leaveRows[0].paidLeaveDays || 0;

        // Tổng ngày làm + ngày nghỉ phép (tối đa 26)
        const actualWorkingDays = Math.min(26, workingDaysFromAttendance + paidLeaveDays);

        // Lương thực tế
        const grossSalary = (baseSalary / 26) * actualWorkingDays;

        // Thưởng/Phạt
        const [rewardRows] = await db.query(
            'SELECT SUM(CASE WHEN Loai = "Thuong" THEN SoTien ELSE 0 END) as totalReward, SUM(CASE WHEN Loai = "Phat" THEN SoTien ELSE 0 END) as totalPenalty FROM ThuongPhat WHERE NhanVienID = ? AND MONTH(Ngay) = ? AND YEAR(Ngay) = ?',
            [employeeId, month, year]
        );
        const totalReward = rewardRows[0].totalReward || 0;
        const totalPenalty = rewardRows[0].totalPenalty || 0;

        // Khấu trừ (10.5% lương CB)
        const totalDeductions = baseSalary * 0.105;

        // Tổng thu nhập và thực lãnh
        const totalIncome = grossSalary + totalReward - totalPenalty;
        const netSalary = totalIncome - totalDeductions;

        return {
            baseSalary,
            actualWorkingDays,
            grossSalary,
            totalReward,
            totalPenalty,
            totalDeductions,
            netSalary
        };
    }

    // Lấy lương của một nhân viên (cho Employee xem chính mình)
    static async getByEmployee(employeeId, month, year) {
        let query = 'SELECT * FROM BangLuong WHERE NhanVienID = ?';
        const params = [employeeId];

        if (month) {
            query += ' AND Thang = ?';
            params.push(parseInt(month));
        }
        if (year) {
            query += ' AND Nam = ?';
            params.push(parseInt(year));
        }

        query += ' ORDER BY Nam DESC, Thang DESC';

        const [rows] = await db.query(query, params);
        return rows;
    }

    // Lấy dữ liệu lương tổng cho tháng/năm (cho Admin/Manager xuất)
    static async getSalaryByMonth(filters = {}) {
        const { phongBan, month, year } = filters;
        
        let query = `
            SELECT 
                bl.*,
                nv.HoTen,
                nv.MaNhanVien,
                pb.TenPhongBan,
                cv.TenChucVu,
                nv.PhongBanID
            FROM BangLuong bl
            JOIN NhanVien nv ON bl.NhanVienID = nv.MaNhanVien
            JOIN PhongBan pb ON nv.PhongBanID = pb.MaPhongBan
            JOIN ChucVu cv ON nv.ChucVuID = cv.MaChucVu
            WHERE bl.Thang = ? AND bl.Nam = ?
        `;
        const params = [month, year];

        if (phongBan) {
            query += ' AND nv.PhongBanID = ?';
            params.push(phongBan);
        }

        query += ' ORDER BY pb.TenPhongBan, nv.HoTen';

        const [rows] = await db.query(query, params);
        return rows;
    }

    // Lưu lương vào DB
    static async create(salaryData) {
        const { nhanVienID, thang, nam, luongCoBan, thuong, phat, tongThuNhap, khauTru } = salaryData;
        const [result] = await db.query(
            'INSERT INTO BangLuong (NhanVienID, Thang, Nam, LuongCoBan, Thuong, Phat, TongThuNhap, KhauTru) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [nhanVienID, thang, nam, luongCoBan, thuong, phat, tongThuNhap, khauTru]
        );
        return result.insertId;
    }
}

module.exports = Salary;