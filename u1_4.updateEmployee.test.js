const { mockRes } = require("./helpers");

jest.mock("../models/Employee", () => ({
  findById: jest.fn(),
  checkEmailExists: jest.fn(),
  checkPhoneExists: jest.fn(),
  update: jest.fn(),
}));

const Employee = require("../models/Employee");
const employeeController = require("../controllers/employeeController");

describe("U1.4 - updateEmployee", () => {
  beforeEach(() => jest.clearAllMocks());

  test("Không tìm thấy nhân viên -> 404", async () => {
    Employee.findById.mockResolvedValue(null);

    const req = { params: { id: "10" }, body: {}, user: { vaiTro: "Admin" } };
    const res = mockRes();

    await employeeController.updateEmployee(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Không tìm thấy nhân viên" });
  });

  test("Manager sửa nhân viên khác phòng -> 403", async () => {
    Employee.findById.mockResolvedValue({ PhongBanID: 2, AnhDaiDien: null });

    const req = {
      params: { id: "10" },
      body: {},
      file: null,
      user: { vaiTro: "Manager", phongBanId: 1 },
    };
    const res = mockRes();

    await employeeController.updateEmployee(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: "Bạn không có quyền chỉnh sửa nhân viên này" });
  });

  test("Hợp lệ -> 200", async () => {
    Employee.findById.mockResolvedValue({ PhongBanID: 1, AnhDaiDien: "/uploads/a.png" });
    Employee.checkEmailExists.mockResolvedValue(false);
    Employee.checkPhoneExists.mockResolvedValue(false);
    Employee.update.mockResolvedValue();

    const req = {
      params: { id: "10" },
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
      user: { vaiTro: "Manager", phongBanId: 1, id: 99 },
    };
    const res = mockRes();

    await employeeController.updateEmployee(req, res);

    expect(Employee.update).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({ message: "Cập nhật thông tin nhân viên thành công" });
  });
});
