const { mockRes } = require("./helpers");

jest.mock("../models/Employee", () => ({
  findById: jest.fn(),
}));

// Controller có require EditRequest dù test này không dùng -> mock cho khỏi lỗi load
jest.mock("../models/EditRequest", () => ({}));

const Employee = require("../models/Employee");
const profileController = require("../controllers/profileController");

describe("U1.1 - getMyProfile", () => {
  beforeEach(() => jest.clearAllMocks());

  test("Không có maNhanVien trong token -> 404", async () => {
    const req = { user: { vaiTro: "Employee" } };
    const res = mockRes();

    await profileController.getMyProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Không tìm thấy thông tin nhân viên" });
    expect(Employee.findById).not.toHaveBeenCalled();
  });

  test("Không tìm thấy nhân viên theo maNhanVien -> 404", async () => {
    Employee.findById.mockResolvedValue(null);

    const req = { user: { maNhanVien: 123, vaiTro: "Employee" } };
    const res = mockRes();

    await profileController.getMyProfile(req, res);

    expect(Employee.findById).toHaveBeenCalledWith(123);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Không tìm thấy thông tin nhân viên" });
  });

  test("Thành công -> trả về json employee", async () => {
    const fakeEmployee = { MaNhanVien: 123, HoTen: "Nguyễn A" };
    Employee.findById.mockResolvedValue(fakeEmployee);

    const req = { user: { maNhanVien: 123, vaiTro: "Employee" } };
    const res = mockRes();

    await profileController.getMyProfile(req, res);

    expect(Employee.findById).toHaveBeenCalledWith(123);
    expect(res.json).toHaveBeenCalledWith(fakeEmployee);
  });
});
