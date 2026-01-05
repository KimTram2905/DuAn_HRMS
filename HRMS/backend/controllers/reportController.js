// controllers/reportController.js
const Report = require('../models/Report');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// ===================== U5.1 - BÁO CÁO NHÂN SỰ =====================

exports.getEmployeeReport = async (req, res) => {
    try {
        const { phongBan, month, year } = req.query;
        
        const data = await Report.getEmployeeReport({ phongBan, month, year });
        
        res.json(data);
    } catch (error) {
        console.error('Get employee report error:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// ===================== U5.2 - BÁO CÁO CHẤM CÔNG =====================

exports.getAttendanceReport = async (req, res) => {
    try {
        const { phongBan, month, year } = req.query;
        
        const data = await Report.getAttendanceReport({ phongBan, month, year });
        
        res.json(data);
    } catch (error) {
        console.error('Get attendance report error:', error);
        res.status(500).json({ message: error.message || 'Lỗi server' });
    }
};

// ===================== U5.3 - BÁO CÁO LƯƠNG =====================

exports.getSalaryReport = async (req, res) => {
    try {
        const { phongBan, month, year } = req.query;
        
        const data = await Report.getSalaryReport({ phongBan, month, year });
        
        res.json(data);
    } catch (error) {
        console.error('Get salary report error:', error);
        res.status(500).json({ message: error.message || 'Lỗi server' });
    }
};

// ===================== XUẤT BÁO CÁO EXCEL =====================

exports.exportToExcel = async (req, res) => {
    try {
        const { type, phongBan, month, year } = req.query;
        
        let data = [];
        let sheetName = '';
        let columns = [];

        // Lấy dữ liệu theo loại báo cáo
        switch (type) {
            case 'NhanSu':
                data = await Report.getEmployeeReport({ phongBan, month, year });
                sheetName = 'Báo cáo Nhân sự';
                columns = [
                    { header: 'Phòng ban', key: 'TenPhongBan', width: 25 },
                    { header: 'Số nhân viên', key: 'SoNhanVien', width: 15 },
                    { header: 'Số Nam', key: 'SoNam', width: 15 },
                    { header: 'Số Nữ', key: 'SoNu', width: 15 },
                    { header: 'Độ tuổi TB', key: 'DoTuoiTrungBinh', width: 15 }
                ];
                break;

            case 'ChamCong':
                data = await Report.getAttendanceReport({ phongBan, month, year });
                sheetName = 'Báo cáo Chấm công';
                columns = [
                    { header: 'Nhân viên', key: 'NhanVien', width: 25 },
                    { header: 'Tổng giờ làm', key: 'TongGioLam', width: 15 },
                    { header: 'Ngày nghỉ', key: 'NgayNghi', width: 15 },
                    { header: 'Đi muộn (lần)', key: 'DiMuon', width: 15 }
                ];
                break;

            case 'Luong':
                data = await Report.getSalaryReport({ phongBan, month, year });
                sheetName = 'Báo cáo Lương';
                columns = [
                    { header: 'Phòng ban', key: 'TenPhongBan', width: 25 },
                    { header: 'Tổng quỹ lương (VND)', key: 'TongQuyLuong', width: 20 },
                    { header: 'So với tháng trước (%)', key: 'SoVoiThangTruoc', width: 25 }
                ];
                break;

            default:
                return res.status(400).json({ message: 'Loại báo cáo không hợp lệ' });
        }

        // Tạo workbook
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(sheetName);

        worksheet.columns = columns;

        // Thêm dữ liệu
        data.forEach(row => {
            worksheet.addRow(row);
        });

        // Style header
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF4472C4' }
        };
        worksheet.getRow(1).font = { color: { argb: 'FFFFFFFF' }, bold: true };

        // Tạo file
        const fileName = `BaoCao_${type}_${Date.now()}.xlsx`;
        const filePath = path.join(__dirname, '../uploads/reports', fileName);

        // Đảm bảo thư mục tồn tại
        if (!fs.existsSync(path.join(__dirname, '../uploads/reports'))) {
            fs.mkdirSync(path.join(__dirname, '../uploads/reports'), { recursive: true });
        }

        await workbook.xlsx.writeFile(filePath);

        // Lưu lịch sử
        await Report.saveReportHistory({
            loaiBaoCao: type,
            nguoiTaoID: req.user.id,
            duongDanFile: `/uploads/reports/${fileName}`
        });

        res.json({
            message: 'Xuất báo cáo thành công',
            downloadUrl: `/uploads/reports/${fileName}`
        });

    } catch (error) {
        console.error('Export to Excel error:', error);
        res.status(500).json({ message: error.message || 'Lỗi server' });
    }
};

// ===================== XUẤT BÁO CÁO PDF =====================

exports.exportToPDF = async (req, res) => {
    try {
        const { type, phongBan, month, year } = req.query;
        
        let data = [];
        let title = '';

        // Lấy dữ liệu theo loại báo cáo
        switch (type) {
            case 'NhanSu':
                data = await Report.getEmployeeReport({ phongBan, month, year });
                title = 'BÁO CÁO NHÂN SỰ';
                break;
            case 'ChamCong':
                data = await Report.getAttendanceReport({ phongBan, month, year });
                title = 'BÁO CÁO CHẤM CÔNG';
                break;
            case 'Luong':
                data = await Report.getSalaryReport({ phongBan, month, year });
                title = 'BÁO CÁO LƯƠNG';
                break;
            default:
                return res.status(400).json({ message: 'Loại báo cáo không hợp lệ' });
        }

        const fileName = `BaoCao_${type}_${Date.now()}.pdf`;
        const filePath = path.join(__dirname, '../uploads/reports', fileName);

        // Đảm bảo thư mục tồn tại
        if (!fs.existsSync(path.join(__dirname, '../uploads/reports'))) {
            fs.mkdirSync(path.join(__dirname, '../uploads/reports'), { recursive: true });
        }

        // Tạo PDF
        const doc = new PDFDocument({ margin: 50 });
        doc.pipe(fs.createWriteStream(filePath));

        // Header
        doc.fontSize(20).text(title, { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Thời gian: Tháng ${month}/${year}`, { align: 'center' });
        doc.moveDown(2);

        // Table
        const tableTop = doc.y;
        let currentY = tableTop;

        // Vẽ bảng dựa theo loại báo cáo
        if (type === 'NhanSu') {
            // Header
            doc.fontSize(10).text('Phòng ban', 50, currentY, { width: 150 });
            doc.text('Số NV', 200, currentY, { width: 60 });
            doc.text('Nam', 260, currentY, { width: 50 });
            doc.text('Nữ', 310, currentY, { width: 50 });
            doc.text('Tuổi TB', 360, currentY, { width: 80 });
            currentY += 20;

            // Data
            data.forEach(row => {
                doc.text(row.TenPhongBan || '', 50, currentY, { width: 150 });
                doc.text((row.SoNhanVien || 0).toString(), 200, currentY, { width: 60 });
                doc.text((row.SoNam || 0).toString(), 260, currentY, { width: 50 });
                doc.text((row.SoNu || 0).toString(), 310, currentY, { width: 50 });
                doc.text((row.DoTuoiTrungBinh || 0).toString(), 360, currentY, { width: 80 });
                currentY += 20;
            });
        } else if (type === 'ChamCong') {
            // Header
            doc.fontSize(10).text('Nhân viên', 50, currentY, { width: 150 });
            doc.text('Giờ làm', 200, currentY, { width: 80 });
            doc.text('Nghỉ', 280, currentY, { width: 60 });
            doc.text('Muộn', 340, currentY, { width: 60 });
            currentY += 20;

            // Data
            data.forEach(row => {
                doc.text(row.NhanVien || '', 50, currentY, { width: 150 });
                doc.text((row.TongGioLam || 0).toString(), 200, currentY, { width: 80 });
                doc.text((row.NgayNghi || 0).toString(), 280, currentY, { width: 60 });
                doc.text((row.DiMuon || 0).toString(), 340, currentY, { width: 60 });
                currentY += 20;
            });
        } else if (type === 'Luong') {
            // Header
            doc.fontSize(10).text('Phòng ban', 50, currentY, { width: 150 });
            doc.text('Tổng lương', 200, currentY, { width: 120 });
            doc.text('Thay đổi (%)', 320, currentY, { width: 100 });
            currentY += 20;

            // Data
            data.forEach(row => {
                doc.text(row.TenPhongBan || '', 50, currentY, { width: 150 });
                doc.text((row.TongQuyLuong || 0).toLocaleString('vi-VN'), 200, currentY, { width: 120 });
                doc.text((row.SoVoiThangTruoc || 0).toString() + '%', 320, currentY, { width: 100 });
                currentY += 20;
            });
        }

        doc.end();

        // Lưu lịch sử
        await Report.saveReportHistory({
            loaiBaoCao: type,
            nguoiTaoID: req.user.id,
            duongDanFile: `/uploads/reports/${fileName}`
        });

        res.json({
            message: 'Xuất báo cáo thành công',
            downloadUrl: `/uploads/reports/${fileName}`
        });

    } catch (error) {
        console.error('Export to PDF error:', error);
        res.status(500).json({ message: error.message || 'Lỗi server' });
    }
};

// ===================== LỊCH SỬ BÁO CÁO =====================

exports.getReportHistory = async (req, res) => {
    try {
        const { loaiBaoCao } = req.query;
        
        const history = await Report.getReportHistory({ loaiBaoCao });
        
        res.json(history);
    } catch (error) {
        console.error('Get report history error:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};