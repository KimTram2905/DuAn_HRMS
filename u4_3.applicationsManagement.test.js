const { mockRes } = require("./helpers");

// Mock đúng model Recruitment
jest.mock("../models/Recruitment", () => ({
  getAllApplications: jest.fn(),
  getApplicationById: jest.fn(),
  getNotesByApplication: jest.fn(),
}));

const Recruitment = require("../models/Recruitment");
const recruitmentController = require("../controllers/recruitmentController");

describe("U4.3 - Applications Management (Unit Test)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ===== U4.3: Lấy danh sách hồ sơ =====
  test("getApplications: truyền status & search -> trả danh sách", async () => {
    Recruitment.getAllApplications.mockResolvedValue([{ MaHoSo: "HS001" }]);

    const req = {
      query: { status: "DangXuLy", search: "Nguyen" },
      user: { vaiTro: "Manager" },
    };
    const res = mockRes();

    await recruitmentController.getApplications(req, res);

    expect(Recruitment.getAllApplications).toHaveBeenCalledWith({
      status: "DangXuLy",
      search: "Nguyen",
    });
    expect(res.json).toHaveBeenCalledWith([{ MaHoSo: "HS001" }]);
  });

  test("getApplications: model lỗi -> 500", async () => {
    Recruitment.getAllApplications.mockRejectedValue(new Error("DB error"));

    const req = { query: {}, user: { vaiTro: "Admin" } };
    const res = mockRes();

    await recruitmentController.getApplications(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Lỗi server" });
  });

  // ===== (Thường UI U4.3 có nút “Xem chi tiết”) =====
  // Trong backend bạn, chi tiết nằm ở getApplicationDetail
  test("getApplicationDetail: không tìm thấy hồ sơ -> 404", async () => {
    Recruitment.getApplicationById.mockResolvedValue(null);

    const req = { params: { id: "HS999" }, user: { vaiTro: "Manager" } };
    const res = mockRes();

    await recruitmentController.getApplicationDetail(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Không tìm thấy hồ sơ" });
  });

  test("getApplicationDetail: có hồ sơ -> trả application + notes", async () => {
    Recruitment.getApplicationById.mockResolvedValue({ MaHoSo: "HS001" });
    Recruitment.getNotesByApplication.mockResolvedValue([{ NoiDung: "OK" }]);

    const req = { params: { id: "HS001" }, user: { vaiTro: "Admin" } };
    const res = mockRes();

    await recruitmentController.getApplicationDetail(req, res);

    expect(res.json).toHaveBeenCalledWith({
      application: { MaHoSo: "HS001" },
      notes: [{ NoiDung: "OK" }],
    });
  });
});
