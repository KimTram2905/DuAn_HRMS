const { mockRes } = require("./helpers");

jest.mock("../models/Employee", () => ({
  checkEmailExists: jest.fn(),
  checkPhoneExists: jest.fn(),
  create: jest.fn(),
}));

const Employee = require("../models/Employee");
const employeeController = require("../controllers/employeeController");

describe("U1.3 - createEmployee", () => {
  beforeEach(() => jest.clearAllMocks());

  test("Thiếu field bắt buộc -> 400", async () => {
    const req = {
      body: { hoTen: "A" }, // thiếu nhiều field
      file: null,
      user: { vaiTro: "Admin" },
    };
    const res = mockRes();

    await employeeController.createEmployee(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.any(String) })
    );
  });

  test("Email trùng -> 400", async () => {
    Employee.checkEmailExists.mockResolvedValue(true);

    const req = {
      body: {
        hoTen: "A",
        ngaySinh: "2000-01-01",
        email: "a@a.com",
        soDienThoai: "0123456789",
        gioiTinh: "Nam",
        phongBanID: 1,
        chucVuID: 1,
        loaiHopDong: "ChinhThuc",
        ngayBatDauHopDong: "2025-01-01",
        luongCoBan: 10000000,
      },
      file: null,
      user: { vaiTro: "Admin" },
    };
    const res = mockRes();

    await employeeController.createEmployee(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Email đã tồn tại" });
  });

  test("Tuổi < 18 -> 400", async () => {
    Employee.checkEmailExists.mockResolvedValue(false);
    Employee.checkPhoneExists.mockResolvedValue(false);

    const req = {
      body: {
        hoTen: "A",
        ngaySinh: "2010-01-01", // < 18
        email: "a@a.com",
        soDienThoai: "0123456789",
        gioiTinh: "Nam",
        phongBanID: 1,
        chucVuID: 1,
        loaiHopDong: "ChinhThuc",
        ngayBatDauHopDong: "2025-01-01",
        luongCoBan: 10000000,
      },
      file: null,
      user: { vaiTro: "Admin" },
    };
    const res = mockRes();

    await employeeController.createEmployee(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Nhân viên phải từ 18 tuổi trở lên" });
  });

  test("Hợp lệ -> 201", async () => {
    Employee.checkEmailExists.mockResolvedValue(false);
    Employee.checkPhoneExists.mockResolvedValue(false);
    Employee.create.mockResolvedValue({
      employeeId: 10,
      username: "nv0010",
      password: "123456",
    });

    const req = {
      body: {
        hoTen: "A",
        ngaySinh: "2000-01-01",
        email: "a@a.com",
        soDienThoai: "0123456789",
        gioiTinh: "Nam",
        phongBanID: 1,
        chucVuID: 1,
        loaiHopDong: "ChinhThuc",
        ngayBatDauHopDong: "2025-01-01",
        luongCoBan: 10000000,
      },
      file: null,
      user: { vaiTro: "Admin" },
    };
    const res = mockRes();

    await employeeController.createEmployee(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Thêm nhân viên thành công",
        employeeId: 10,
      })
    );
  });
});
