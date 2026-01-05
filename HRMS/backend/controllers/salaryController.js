const Salary = require('../models/Salary');
const Employee = require('../models/Employee');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');

// Tính lương hàng tháng (cho một nhân viên)
exports.calculateSalary = async (req, res) => {
    try {
        const { employeeId, month, year } = req.params;
        const employeeIdNum = parseInt(employeeId);

        // Kiểm tra quyền: Manager chỉ tính cho phòng của mình
        if (req.user.vaiTro === 'Manager') {
            const employee = await Employee.findById(employeeIdNum);
            if (!employee || employee.PhongBanID !== req.user.phongBanId) {
                return res.status(403).json({ message: 'Bạn không có quyền tính lương cho nhân viên này' });
            }
        }

        const salaryData = await Salary.calculateMonthlySalary(employeeIdNum, month, year);
        res.json(salaryData);
    } catch (error) {
        console.error('Calculate salary error:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Lưu lương vào DB (sau khi tính)
exports.saveSalary = async (req, res) => {
    try {
        const { employeeId, month, year } = req.params;
        const employeeIdNum = parseInt(employeeId);

        const salaryData = await Salary.calculateMonthlySalary(employeeIdNum, month, year);
        const salaryId = await Salary.create({
            nhanVienID: employeeIdNum,
            thang: month,
            nam: year,
            luongCoBan: salaryData.baseSalary,
            thuong: salaryData.totalReward,
            phat: salaryData.totalPenalty,
            tongThuNhap: salaryData.netSalary,
            khauTru: salaryData.totalDeductions
        });

        res.status(201).json({ message: 'Lưu bảng lương thành công', salaryId });
    } catch (error) {
        console.error('Save salary error:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Xem lương của chính mình (Employee)
exports.getEmployeeSalaries = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const { month, year } = req.query;
        const employeeIdNum = parseInt(employeeId);

        if (req.user.maNhanVien !== employeeIdNum) {
            return res.status(403).json({ message: 'Bạn chỉ có thể xem bảng lương của chính mình' });
        }

        const salaries = await Salary.getByEmployee(employeeIdNum, month, year);
        res.json(salaries);
    } catch (error) {
        console.error('Get employee salaries error:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Xem bảng lương tổng (Admin/Manager)
exports.getSalaries = async (req, res) => {
    try {
        const { month, year, phongBan } = req.query;
        if (!month || !year) {
            return res.status(400).json({ message: 'Vui lòng chọn tháng và năm' });
        }
        const filters = { month, year };
        if (req.user.vaiTro === 'Manager') {
            filters.phongBan = req.user.phongBanId;
        } else if (phongBan) {
            filters.phongBan = phongBan;
        }
        const salaries = await Salary.getSalaryByMonth(filters);
        res.json(salaries);
    } catch (error) {
        console.error('Get salaries error:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Xuất lương cá nhân (Excel/PDF, từ tính toán)
exports.exportSalary = async (req, res) => {
    try {
        const { employeeId, month, year, format } = req.params;
        const employeeIdNum = parseInt(employeeId);

        if (req.user.vaiTro === 'Manager') {
            const employee = await Employee.findById(employeeIdNum);
            if (!employee || employee.PhongBanID !== req.user.phongBanId) {
                return res.status(403).json({ message: 'Bạn không có quyền xuất lương cho nhân viên này' });
            }
        }

        const salaryData = await Salary.calculateMonthlySalary(employeeIdNum, month, year);
        if (salaryData.note) {
            return res.status(404).json({ message: salaryData.note });
        }

        const fileName = `Luong_${employeeId}_${month}_${year}_${Date.now()}`;

        if (format === 'excel') {
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('LuongCaNhan');
            worksheet.columns = [
                { header: 'Mô tả', key: 'desc', width: 30 },
                { header: 'Giá trị', key: 'value', width: 20 },
            ];
            worksheet.addRow({ desc: 'Lương Cơ Bản', value: salaryData.baseSalary });
            worksheet.addRow({ desc: 'Ngày Làm Việc Thực Tế', value: salaryData.actualWorkingDays });
            worksheet.addRow({ desc: 'Lương Thực Tế', value: salaryData.grossSalary });
            worksheet.addRow({ desc: 'Thưởng', value: salaryData.totalReward });
            worksheet.addRow({ desc: 'Phạt', value: salaryData.totalPenalty });
            worksheet.addRow({ desc: 'Khấu Trừ', value: salaryData.totalDeductions });
            worksheet.addRow({ desc: 'Thực Lãnh', value: salaryData.netSalary });

            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename=${fileName}.xlsx`);
            await workbook.xlsx.write(res);
            res.end();
        } else if (format === 'pdf') {
            const doc = new PDFDocument();
            const fontRegular = path.join(__dirname, '../fonts/Roboto-Regular.ttf');
            const fontBold = path.join(__dirname, '../fonts/Roboto-Bold.ttf');
            if (fs.existsSync(fontRegular) && fs.existsSync(fontBold)) {
                doc.registerFont('Roboto-Regular', fontRegular);
                doc.registerFont('Roboto-Bold', fontBold);
            } else {
                console.warn('Font Roboto không tìm thấy, dùng font mặc định.');
            }

            doc.font('Roboto-Bold').fontSize(16).text('BẢNG LƯƠNG CÁ NHÂN', { align: 'center' });
            doc.moveDown();
            doc.font('Roboto-Regular').fontSize(12);
            doc.text(`Lương Cơ Bản: ${salaryData.baseSalary.toLocaleString('vi-VN')} VND`);
            doc.text(`Ngày Làm Việc Thực Tế: ${salaryData.actualWorkingDays}`);
            doc.text(`Lương Thực Tế: ${salaryData.grossSalary.toLocaleString('vi-VN')} VND`);
            doc.text(`Thưởng: ${salaryData.totalReward.toLocaleString('vi-VN')} VND`);
            doc.text(`Phạt: ${salaryData.totalPenalty.toLocaleString('vi-VN')} VND`);
            doc.text(`Khấu Trừ: ${salaryData.totalDeductions.toLocaleString('vi-VN')} VND`);
            doc.text(`Thực Lãnh: ${salaryData.netSalary.toLocaleString('vi-VN')} VND`);

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=${fileName}.pdf`);
            doc.pipe(res);
            doc.end();
        } else {
            return res.status(400).json({ message: 'Định dạng không hợp lệ (excel hoặc pdf)' });
        }
    } catch (error) {
        console.error('Export salary error:', error);
        res.status(500).json({ message: 'Lỗi xuất lương cá nhân' });
    }
};

// Xuất Excel tổng
exports.exportExcel = async (req, res) => {
    try {
        const { month, year, phongBan } = req.query;
        if (!month || !year) {
            return res.status(400).json({ message: 'Vui lòng chọn tháng và năm' });
        }
        const filters = { month, year };
        if (req.user.vaiTro === 'Manager') {
            filters.phongBan = req.user.phongBanId;
        } else if (phongBan) {
            filters.phongBan = phongBan;
        }
        const salaries = await Salary.getSalaryByMonth(filters);
        if (salaries.length === 0) {
            return res.status(404).json({ message: 'Không có dữ liệu lương' });
        }

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('BangLuong');
        worksheet.mergeCells('A1:J1');
        worksheet.getCell('A1').value = `BẢNG LƯƠNG THÁNG ${month}/${year}`;
        worksheet.getCell('A1').font = { bold: true, size: 16 };
        worksheet.getCell('A1').alignment = { horizontal: 'center' };
        worksheet.getRow(1).height = 30;

        const headerRow = worksheet.addRow(['Mã NV', 'Họ tên', 'Phòng ban', 'Chức vụ', 'Lương CB', 'Thưởng', 'Phạt', 'Tổng TN', 'Khấu trừ', 'Thực nhận']);
        headerRow.font = { bold: true };
        headerRow.eachCell(cell => {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '4472C4' } };
            cell.font = { bold: true, color: { argb: 'FFFFFF' } };
            cell.alignment = { horizontal: 'center' };
            cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        });

        // Thêm dữ liệu với giá trị số và định dạng
        salaries.forEach(salary => {
            const thucNhan = Number(salary.TongThuNhap || 0) - Number(salary.KhauTru || 0);
            const row = worksheet.addRow([
                salary.MaNhanVien,
                salary.HoTen,
                salary.TenPhongBan,
                salary.TenChucVu,
                Number(salary.LuongCoBan || 0),
                Number(salary.Thuong || 0),
                Number(salary.Phat || 0),
                Number(salary.TongThuNhap || 0),
                Number(salary.KhauTru || 0),
                thucNhan
            ]);
            // Định dạng số cho các cột từ E (index 5) trở đi
            row.eachCell((cell, colNumber) => {
                if (colNumber >= 5) {  // Cột E (5) đến J (10)
                    cell.numFmt = '#,##0';  // Định dạng số với dấu phẩy
                }
            });
        });

        // Tổng cộng với công thức SUM
        const totalRow = worksheet.addRow([
            '', '', '', 'TỔNG CỘNG',
            { formula: `SUM(E3:E${salaries.length + 2})` },
            { formula: `SUM(F3:F${salaries.length + 2})` },
            { formula: `SUM(G3:G${salaries.length + 2})` },
            { formula: `SUM(H3:H${salaries.length + 2})` },
            { formula: `SUM(I3:I${salaries.length + 2})` },
            { formula: `SUM(J3:J${salaries.length + 2})` }
        ]);
        totalRow.font = { bold: true };
        totalRow.eachCell(cell => {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'D9E1F2' } };
            cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
            if (cell.col > 4) cell.numFmt = '#,##0';  // Đảm bảo tổng cũng định dạng số
        });

        worksheet.columns = [
            { width: 10 }, { width: 25 }, { width: 20 }, { width: 15 },
            { width: 15 }, { width: 15 }, { width: 15 }, { width: 15 },
            { width: 15 }, { width: 15 }
        ];

        const fileName = `BangLuong_${month}_${year}_${Date.now()}.xlsx`;
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error('Export Excel error:', error);
        res.status(500).json({ message: 'Lỗi xuất Excel' });
    }
};

// Xuất PDF tổng
exports.exportPDF = async (req, res) => {
    try {
        const { month, year, phongBan } = req.query;
        if (!month || !year) {
            return res.status(400).json({ message: 'Vui lòng chọn tháng và năm' });
        }

        const filters = { month, year };
        if (req.user.vaiTro === 'Manager') {
            filters.phongBan = req.user.phongBanId;
        } else if (phongBan) {
            filters.phongBan = phongBan;
        }

        const salaries = await Salary.getSalaryByMonth(filters);
        if (salaries.length === 0) {
            return res.status(404).json({ message: 'Không có dữ liệu lương' });
        }

        const doc = new PDFDocument({
            size: 'A4',
            layout: 'landscape',
            margin: 30
        });

        const fileName = `BangLuong_${month}_${year}_${Date.now()}.pdf`;
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        doc.pipe(res);

        // ===== FONT =====
        const fontRegular = path.join(__dirname, '../fonts/Roboto-Regular.ttf');
        const fontBold = path.join(__dirname, '../fonts/Roboto-Bold.ttf');
        if (fs.existsSync(fontRegular) && fs.existsSync(fontBold)) {
            doc.registerFont('R', fontRegular);
            doc.registerFont('B', fontBold);
        }

        // ===== TITLE =====
        doc.font('B').fontSize(18)
            .text(`BẢNG LƯƠNG THÁNG ${month}/${year}`, { align: 'center' });
        doc.moveDown(1);

        // ===== TABLE CONFIG =====
        const headers = [
            'Mã NV', 'Họ tên', 'Phòng ban', 'Chức vụ',
            'Lương CB', 'Thưởng', 'Phạt', 'Tổng TN', 'Khấu trừ', 'Thực nhận'
        ];

        const colWidths = [50, 110, 90, 80, 80, 70, 70, 85, 80, 85];
        const rowHeight = 22;
        const pageWidth = doc.page.width;
        const tableWidth = colWidths.reduce((a, b) => a + b, 0);
        const startX = (pageWidth - tableWidth) / 2;
        let y = doc.y + 10;

        // ===== DRAW HEADER =====
        const drawHeader = () => {
            let x = startX;
            doc.font('B').fontSize(9);

            headers.forEach((h, i) => {
                doc.rect(x, y, colWidths[i], rowHeight)
                    .fillAndStroke('#4472C4', '#000');
                doc.fillColor('#fff')
                    .text(h, x + 4, y + 6, {
                        width: colWidths[i] - 8,
                        align: i >= 4 ? 'right' : 'center'
                    });
                x += colWidths[i];
            });

            doc.fillColor('#000');
            y += rowHeight;
        };

        drawHeader();

        // ===== ROWS =====
        doc.font('R').fontSize(9);

        salaries.forEach((s, index) => {
            if (y + rowHeight > doc.page.height - 50) {
                doc.addPage();
                y = 50;
                drawHeader();
            }

            const thucNhan = s.TongThuNhap - s.KhauTru;
            const row = [
                s.MaNhanVien,
                s.HoTen,
                s.TenPhongBan,
                s.TenChucVu,
                formatNumber(s.LuongCoBan),
                formatNumber(s.Thuong),
                formatNumber(s.Phat),
                formatNumber(s.TongThuNhap),
                formatNumber(s.KhauTru),
                formatNumber(thucNhan)
            ];

            let x = startX;

            row.forEach((cell, i) => {
                if (index % 2 === 0) {
                    doc.rect(x, y, colWidths[i], rowHeight)
                        .fillAndStroke('#f9fafb', '#000');
                } else {
                    doc.rect(x, y, colWidths[i], rowHeight)
                        .stroke();
                }

                // 🔴 CỰC KỲ QUAN TRỌNG
                doc.fillColor('#000');

                doc.text(String(cell), x + 4, y + 6, {
                    width: colWidths[i] - 8,
                    align: i >= 4 ? 'right' : 'left'
                });

                x += colWidths[i];
            });

            y += rowHeight;
        });

        // ===== TOTAL =====
        const totals = {
            luongCB: salaries.reduce((s, r) => s + Number(r.LuongCoBan || 0), 0),
            thuong: salaries.reduce((s, r) => s + Number(r.Thuong || 0), 0),
            phat: salaries.reduce((s, r) => s + Number(r.Phat || 0), 0),
            tongTN: salaries.reduce((s, r) => s + Number(r.TongThuNhap || 0), 0),
            khauTru: salaries.reduce((s, r) => s + Number(r.KhauTru || 0), 0)
        };

        const totalRow = [
            '', '', '', 'TỔNG CỘNG',
            formatNumber(totals.luongCB),
            formatNumber(totals.thuong),
            formatNumber(totals.phat),
            formatNumber(totals.tongTN),
            formatNumber(totals.khauTru),
            formatNumber(totals.tongTN - totals.khauTru)
        ];

        let x = startX;
        doc.font('B');

        totalRow.forEach((cell, i) => {
            doc.rect(x, y, colWidths[i], rowHeight)
                .fillAndStroke('#D9E1F2', '#000');

            doc.fillColor('#000')
                .text(String(cell), x + 4, y + 6, {
                    width: colWidths[i] - 8,
                    align: i >= 4 ? 'right' : i === 3 ? 'center' : 'left'
                });

            x += colWidths[i];
        });

        doc.end();
    } catch (error) {
        console.error('Export PDF error:', error);
        res.status(500).json({ message: 'Lỗi xuất PDF' });
    }
};


function formatNumber(value) {
    return new Intl.NumberFormat('vi-VN').format(value);
}