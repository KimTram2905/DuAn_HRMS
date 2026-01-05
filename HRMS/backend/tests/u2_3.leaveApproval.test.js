const { mockRes } = require("./helpers");

jest.mock("../models/Leave", () => ({
  findById: jest.fn(),
  checkEmployeeDepartment: jest.fn(),
  updateStatus: jest.fn(),
}));

jest.mock("../models/Attendance", () => ({
  createLeaveAttendance: jest.fn(),
}));

const Leave = require("../models/Leave");
const Attendance = require("../models/Attendance");
const leaveController = require("../controllers/leaveController");

describe("U2.3 - processLeaveRequest", () => {
  beforeEach(() => jest.clearAllMocks());

  test("Action không hợp lệ -> 400", async () => {
    const req = { params: { id: "1" }, body: { action: "xxx" }, user: { vaiTro: "Admin" } };
    const res = mockRes();

    await leaveController.processLeaveRequest(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("Không tìm thấy đơn -> 404", async () => {
    Leave.findById.mockResolvedValue(null);

    const req = { params: { id: "1" }, body: { action: "approve" }, user: { vaiTro: "Admin" } };
    const res = mockRes();

    await leaveController.processLeaveRequest(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("Manager duyệt đơn của chính mình -> 403", async () => {
    Leave.findById.mockResolvedValue({
      NhanVienID: 10,
      NgayBatDau: "2025-12-01",
      NgayKetThuc: "2025-12-02",
    });

    const req = {
      params: { id: "1" },
      body: { action: "approve" },
      user: { vaiTro: "Manager", maNhanVien: 10, phongBanId: 1 },
    };
    const res = mockRes();

    await leaveController.processLeaveRequest(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(Leave.updateStatus).not.toHaveBeenCalled();
  });

  test("Approve -> tạo chấm công nghỉ phép theo từng ngày", async () => {
    Leave.findById.mockResolvedValue({
      NhanVienID: 11,
      NgayBatDau: "2025-12-01",
      NgayKetThuc: "2025-12-03", // 3 ngày
    });
    Leave.checkEmployeeDepartment.mockResolvedValue({ ok: true });
    Leave.updateStatus.mockResolvedValue();
    Attendance.createLeaveAttendance.mockResolvedValue();

    const req = {
      params: { id: "1" },
      body: { action: "approve" },
      user: { vaiTro: "Manager", maNhanVien: 99, phongBanId: 1 },
    };
    const res = mockRes();

    await leaveController.processLeaveRequest(req, res);

    expect(Leave.updateStatus).toHaveBeenCalledWith("1", "DaDuyet", 99);
    expect(Attendance.createLeaveAttendance).toHaveBeenCalledTimes(3);
    expect(res.json).toHaveBeenCalledWith({ message: "Phê duyệt đơn thành công" });
  });

  test("Reject -> không tạo chấm công", async () => {
    Leave.findById.mockResolvedValue({
      NhanVienID: 11,
      NgayBatDau: "2025-12-01",
      NgayKetThuc: "2025-12-03",
    });
    Leave.updateStatus.mockResolvedValue();

    const req = {
      params: { id: "1" },
      body: { action: "reject" },
      user: { vaiTro: "Admin", maNhanVien: 1 },
    };
    const res = mockRes();

    await leaveController.processLeaveRequest(req, res);

    expect(Leave.updateStatus).toHaveBeenCalledWith("1", "TuChoi", 1);
    expect(Attendance.createLeaveAttendance).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({ message: "Từ chối đơn thành công" });
  });
});
