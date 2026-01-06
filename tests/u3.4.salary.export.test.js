// tests/u3.4.salary.export.test.js

// ===== Mock models =====
jest.mock("../models/Salary", () => ({
  getSalaryByMonth: jest.fn(),
}));
const Salary = require("../models/Salary");

// ===== Mock exceljs =====
jest.mock("exceljs", () => {
  const makeRow = () => ({
    font: null,
    eachCell: jest.fn((cb) => {
      for (let col = 1; col <= 10; col++) cb({ col }, col);
    }),
  });

  const makeWorksheet = () => {
    const cellA1 = { value: null, font: null, alignment: null };
    return {
      mergeCells: jest.fn(),
      getCell: jest.fn(() => cellA1),
      getRow: jest.fn(() => ({ height: null })),
      addRow: jest.fn(() => makeRow()),
      columns: [],
    };
  };

  const workbook = {
    addWorksheet: jest.fn(() => makeWorksheet()),
    xlsx: { write: jest.fn().mockResolvedValue() },
  };

  return { Workbook: jest.fn(() => workbook) };
});

// ===== Mock pdfkit =====
jest.mock("pdfkit", () => {
  return jest.fn().mockImplementation(() => {
    const doc = {
      page: { width: 1200, height: 800 },
      y: 50,
      registerFont: jest.fn(),
      font: jest.fn().mockReturnThis(),
      fontSize: jest.fn().mockReturnThis(),
      text: jest.fn().mockReturnThis(),
      moveDown: jest.fn().mockReturnThis(),
      rect: jest.fn().mockReturnThis(),
      fillAndStroke: jest.fn().mockReturnThis(),
      fillColor: jest.fn().mockReturnThis(),
      stroke: jest.fn().mockReturnThis(),
      pipe: jest.fn().mockReturnThis(),
      addPage: jest.fn().mockReturnThis(),
      end: jest.fn().mockReturnThis(),
    };
    return doc;
  });
});

const salaryController = require("../controllers/salaryController");

describe("U3.4 - export payroll (Excel/PDF)", () => {
  beforeEach(() => jest.clearAllMocks());

  describe("exportExcel", () => {
    test("Thiếu month/year -> 400", async () => {
      const req = { query: {}, user: { vaiTro: "Admin" } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
        setHeader: jest.fn(),
        end: jest.fn(),
      };

      await salaryController.exportExcel(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Vui lòng chọn tháng và năm" });
      expect(Salary.getSalaryByMonth).not.toHaveBeenCalled();
    });

    test("Không có dữ liệu lương -> 404", async () => {
      Salary.getSalaryByMonth.mockResolvedValue([]);

      const req = { query: { month: "12", year: "2025" }, user: { vaiTro: "Admin" } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
        setHeader: jest.fn(),
        end: jest.fn(),
      };

      await salaryController.exportExcel(req, res);

      expect(Salary.getSalaryByMonth).toHaveBeenCalledWith({ month: "12", year: "2025" });
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Không có dữ liệu lương" });
    });

    test("Manager -> auto filter phongBanId, xuất OK -> setHeader + end", async () => {
      Salary.getSalaryByMonth.mockResolvedValue([
        {
          MaNhanVien: 1,
          HoTen: "A",
          TenPhongBan: "IT",
          TenChucVu: "Dev",
          LuongCoBan: 10000000,
          Thuong: 1000000,
          Phat: 0,
          TongThuNhap: 11000000,
          KhauTru: 500000,
          ThucNhan: 10500000,
        },
      ]);

      const req = {
        query: { month: "12", year: "2025" },
        user: { vaiTro: "Manager", phongBanId: 2 },
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
        setHeader: jest.fn(),
        end: jest.fn(),
        // workbook.xlsx.write(res) sẽ dùng res như stream => thêm cho chắc
        write: jest.fn(),
        on: jest.fn(),
      };

      await salaryController.exportExcel(req, res);

      expect(Salary.getSalaryByMonth).toHaveBeenCalledWith({ month: "12", year: "2025", phongBan: 2 });

      expect(res.setHeader).toHaveBeenCalledWith(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      expect(res.setHeader).toHaveBeenCalledWith(
        "Content-Disposition",
        expect.stringContaining('attachment; filename="BangLuong_12_2025_')
      );
      expect(res.end).toHaveBeenCalled();
    });
  });

  describe("exportPDF", () => {
    test("Thiếu month/year -> 400", async () => {
      const req = { query: {}, user: { vaiTro: "Admin" } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
        setHeader: jest.fn(),
        end: jest.fn(),
      };

      await salaryController.exportPDF(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Vui lòng chọn tháng và năm" });
    });

    test("Không có dữ liệu lương -> 404", async () => {
      Salary.getSalaryByMonth.mockResolvedValue([]);

      const req = { query: { month: "12", year: "2025" }, user: { vaiTro: "Admin" } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
        setHeader: jest.fn(),
        end: jest.fn(),
      };

      await salaryController.exportPDF(req, res);

      expect(Salary.getSalaryByMonth).toHaveBeenCalledWith({ month: "12", year: "2025" });
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Không có dữ liệu lương" });
    });

    test("Xuất PDF OK -> setHeader", async () => {
      Salary.getSalaryByMonth.mockResolvedValue([
        {
          MaNhanVien: 1,
          HoTen: "A",
          TenPhongBan: "IT",
          TenChucVu: "Dev",
          LuongCoBan: 10000000,
          Thuong: 1000000,
          Phat: 0,
          TongThuNhap: 11000000,
          KhauTru: 500000,
          ThucNhan: 10500000,
        },
      ]);

      const req = { query: { month: "12", year: "2025" }, user: { vaiTro: "Admin" } };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
        setHeader: jest.fn(),
        end: jest.fn(),
        write: jest.fn(),
        on: jest.fn(),
      };

      await salaryController.exportPDF(req, res);

      expect(res.setHeader).toHaveBeenCalledWith("Content-Type", "application/pdf");
      expect(res.setHeader).toHaveBeenCalledWith(
        "Content-Disposition",
        expect.stringContaining('attachment; filename="BangLuong_12_2025_')
      );
    });
  });
});
