const { mockRes } = require("./helpers");

jest.mock("../models/Attendance", () => ({
  // get management
  getByDateRangeManagement: jest.fn(),
  getByMonthManagement: jest.fn(),

  // create for employee
  checkEmployeeDepartment: jest.fn(),
  checkExisting: jest.fn(),
  create: jest.fn(),

  // update/delete
  findById: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
}));

const Attendance = require("../models/Attendance");
const attendanceController = require("../controllers/attendanceController");

describe("U2.4 - Attendance Management (controller unit tests)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ===================== getAttendanceManagement =====================
  describe("getAttendanceManagement", () => {
    test("Có startDate & endDate -> gọi getByDateRangeManagement", async () => {
      Attendance.getByDateRangeManagement.mockResolvedValue([{ id: 1 }]);

      const req = {
        query: { phongBan: "1", startDate: "2025-12-01", endDate: "2025-12-31" },
        user: { vaiTro: "Admin" },
      };
      const res = mockRes();

      await attendanceController.getAttendanceManagement(req, res);

      expect(Attendance.getByDateRangeManagement).toHaveBeenCalledWith({
        phongBan: "1",
        startDate: "2025-12-01",
        endDate: "2025-12-31",
      });
      expect(res.json).toHaveBeenCalledWith({ attendance: [{ id: 1 }] });
    });

    test("Có month & year -> gọi getByMonthManagement", async () => {
      Attendance.getByMonthManagement.mockResolvedValue([{ id: 2 }]);

      const req = {
        query: { phongBan: "2", month: "12", year: "2025" },
        user: { vaiTro: "Manager" },
      };
      const res = mockRes();

      await attendanceController.getAttendanceManagement(req, res);

      expect(Attendance.getByMonthManagement).toHaveBeenCalledWith({
        phongBan: "2",
        month: "12",
        year: "2025",
      });
      expect(res.json).toHaveBeenCalledWith({ attendance: [{ id: 2 }] });
    });

    test("Không truyền gì -> mặc định tháng/năm hiện tại", async () => {
      // mock time: 2025-12-30
      jest.useFakeTimers().setSystemTime(new Date("2025-12-30T00:00:00Z"));

      Attendance.getByMonthManagement.mockResolvedValue([{ id: 3 }]);

      const req = {
        query: { phongBan: "1" },
        user: { vaiTro: "Admin" },
      };
      const res = mockRes();

      await attendanceController.getAttendanceManagement(req, res);

      expect(Attendance.getByMonthManagement).toHaveBeenCalledWith({
        phongBan: "1",
        month: 12,
        year: 2025,
      });
      expect(res.json).toHaveBeenCalledWith({ attendance: [{ id: 3 }] });

      jest.useRealTimers();
    });

    test("Model throw -> 500", async () => {
      Attendance.getByMonthManagement.mockRejectedValue(new Error("DB error"));

      const req = { query: { month: "12", year: "2025" }, user: { vaiTro: "Admin" } };
      const res = mockRes();

      await attendanceController.getAttendanceManagement(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Lỗi server" });
    });
  });

  // ===================== createAttendanceForEmployee =====================
  describe("createAttendanceForEmployee", () => {
    test("Admin -> 403 (không được chấm công)", async () => {
      const req = {
        body: { nhanVienID: 1, ngay: "2025-12-01", gioVao: "08:00" },
        user: { vaiTro: "Admin" },
      };
      const res = mockRes();

      await attendanceController.createAttendanceForEmployee(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        message: "Quản trị viên không có chức năng chấm công",
      });
    });

    test("Thiếu nhanVienID/ngay/gioVao -> 400", async () => {
      const req = { body: { nhanVienID: 1 }, user: { vaiTro: "Manager", phongBanId: 1 } };
      const res = mockRes();

      await attendanceController.createAttendanceForEmployee(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Vui lòng điền đầy đủ thông tin bắt buộc",
      });
    });

    test("Manager chấm công nhân viên ngoài phòng ban -> 403", async () => {
      Attendance.checkEmployeeDepartment.mockResolvedValue(null);

      const req = {
        body: { nhanVienID: 9, ngay: "2025-12-01", gioVao: "08:00", gioRa: "17:00" },
        user: { vaiTro: "Manager", phongBanId: 1 },
      };
      const res = mockRes();

      await attendanceController.createAttendanceForEmployee(req, res);

      expect(Attendance.checkEmployeeDepartment).toHaveBeenCalledWith(9, 1);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        message: "Bạn chỉ được chấm công cho nhân viên trong phòng ban của mình",
      });
    });

    test("Đã tồn tại chấm công ngày đó -> 400", async () => {
      Attendance.checkEmployeeDepartment.mockResolvedValue({ ok: true });
      Attendance.checkExisting.mockResolvedValue({ id: 100 });

      const req = {
        body: { nhanVienID: 9, ngay: "2025-12-01", gioVao: "08:00" },
        user: { vaiTro: "Manager", phongBanId: 1 },
      };
      const res = mockRes();

      await attendanceController.createAttendanceForEmployee(req, res);

      expect(Attendance.checkExisting).toHaveBeenCalledWith(9, "2025-12-01");
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Nhân viên đã được chấm công vào ngày này",
      });
    });

    test("Hợp lệ -> 201", async () => {
      Attendance.checkEmployeeDepartment.mockResolvedValue({ ok: true });
      Attendance.checkExisting.mockResolvedValue(null);
      Attendance.create.mockResolvedValue(555);

      const req = {
        body: { nhanVienID: 9, ngay: "2025-12-01", gioVao: "08:00", gioRa: "17:00" },
        user: { vaiTro: "Manager", phongBanId: 1 },
      };
      const res = mockRes();

      await attendanceController.createAttendanceForEmployee(req, res);

      expect(Attendance.create).toHaveBeenCalledWith({
        nhanVienID: 9,
        ngay: "2025-12-01",
        gioVao: "08:00",
        gioRa: "17:00",
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "Chấm công thành công",
        attendanceId: 555,
      });
    });
  });

  // ===================== updateAttendance =====================
  describe("updateAttendance", () => {
    test("Admin -> 403", async () => {
      const req = {
        params: { id: "1" },
        body: { gioVao: "08:00", gioRa: "17:00" },
        user: { vaiTro: "Admin" },
      };
      const res = mockRes();

      await attendanceController.updateAttendance(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        message: "Quản trị viên không có chức năng sửa chấm công",
      });
    });

    test("Thiếu gioVao -> 400", async () => {
      const req = {
        params: { id: "1" },
        body: { gioRa: "17:00" },
        user: { vaiTro: "Manager", phongBanId: 1 },
      };
      const res = mockRes();

      await attendanceController.updateAttendance(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Giờ vào là bắt buộc" });
    });

    test("Không tìm thấy bản ghi -> 404", async () => {
      Attendance.findById.mockResolvedValue(null);

      const req = {
        params: { id: "1" },
        body: { gioVao: "08:00", gioRa: "17:00" },
        user: { vaiTro: "Manager", phongBanId: 1 },
      };
      const res = mockRes();

      await attendanceController.updateAttendance(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Không tìm thấy bản ghi chấm công" });
    });

    test("Manager sửa ngoài phòng ban -> 403", async () => {
      Attendance.findById.mockResolvedValue({ NhanVienID: 9 });
      Attendance.checkEmployeeDepartment.mockResolvedValue(null);

      const req = {
        params: { id: "1" },
        body: { gioVao: "08:00", gioRa: "17:00" },
        user: { vaiTro: "Manager", phongBanId: 1 },
      };
      const res = mockRes();

      await attendanceController.updateAttendance(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        message: "Bạn chỉ được sửa chấm công cho nhân viên trong phòng ban của mình",
      });
    });

    test("Hợp lệ -> 200", async () => {
      Attendance.findById.mockResolvedValue({ NhanVienID: 9 });
      Attendance.checkEmployeeDepartment.mockResolvedValue({ ok: true });
      Attendance.update.mockResolvedValue();

      const req = {
        params: { id: "1" },
        body: { gioVao: "08:05", gioRa: "17:10" },
        user: { vaiTro: "Manager", phongBanId: 1 },
      };
      const res = mockRes();

      await attendanceController.updateAttendance(req, res);

      expect(Attendance.update).toHaveBeenCalledWith("1", {
        gioVao: "08:05",
        gioRa: "17:10",
      });
      expect(res.json).toHaveBeenCalledWith({ message: "Cập nhật chấm công thành công" });
    });
  });

  // ===================== deleteAttendance =====================
  describe("deleteAttendance", () => {
    test("Admin -> 403", async () => {
      const req = { params: { id: "1" }, user: { vaiTro: "Admin" } };
      const res = mockRes();

      await attendanceController.deleteAttendance(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        message: "Quản trị viên không có chức năng xóa chấm công",
      });
    });

    test("Không tìm thấy bản ghi -> 404", async () => {
      Attendance.findById.mockResolvedValue(null);

      const req = { params: { id: "1" }, user: { vaiTro: "Manager", phongBanId: 1 } };
      const res = mockRes();

      await attendanceController.deleteAttendance(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Không tìm thấy bản ghi chấm công" });
    });

    test("Manager xóa ngoài phòng ban -> 403", async () => {
      Attendance.findById.mockResolvedValue({ NhanVienID: 9 });
      Attendance.checkEmployeeDepartment.mockResolvedValue(null);

      const req = { params: { id: "1" }, user: { vaiTro: "Manager", phongBanId: 1 } };
      const res = mockRes();

      await attendanceController.deleteAttendance(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        message: "Bạn chỉ được xóa chấm công cho nhân viên trong phòng ban của mình",
      });
    });

    test("Hợp lệ -> 200", async () => {
      Attendance.findById.mockResolvedValue({ NhanVienID: 9 });
      Attendance.checkEmployeeDepartment.mockResolvedValue({ ok: true });
      Attendance.delete.mockResolvedValue();

      const req = { params: { id: "1" }, user: { vaiTro: "Manager", phongBanId: 1 } };
      const res = mockRes();

      await attendanceController.deleteAttendance(req, res);

      expect(Attendance.delete).toHaveBeenCalledWith("1");
      expect(res.json).toHaveBeenCalledWith({ message: "Xóa chấm công thành công" });
    });
  });
});
