const { mockRes } = require("./helpers");

jest.mock("../models/Recruitment", () => ({
  create: jest.fn(),
}));

const Recruitment = require("../models/Recruitment");
const recruitmentController = require("../controllers/recruitmentController");

describe("U4.1 - createJob", () => {
  beforeEach(() => jest.clearAllMocks());

  test("Thiếu field bắt buộc -> 400", async () => {
    const req = {
      body: { viTri: "Dev" }, // thiếu moTaCongViec + hanNop
      user: { id: 1, vaiTro: "Manager" },
    };
    const res = mockRes();

    await recruitmentController.createJob(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Vui lòng điền đầy đủ thông tin bắt buộc" });
    expect(Recruitment.create).not.toHaveBeenCalled();
  });

  test("Hạn nộp nhỏ hơn hôm nay -> 400", async () => {
    const req = {
      body: {
        viTri: "Dev",
        moTaCongViec: "Mô tả",
        hanNop: "2000-01-01", // quá khứ
      },
      user: { id: 1, vaiTro: "Manager" },
    };
    const res = mockRes();

    await recruitmentController.createJob(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Hạn nộp phải từ hôm nay trở đi" });
    expect(Recruitment.create).not.toHaveBeenCalled();
  });

  test("Hợp lệ -> 201 + jobId", async () => {
    Recruitment.create.mockResolvedValue(123);

    // future date
    const future = new Date();
    future.setDate(future.getDate() + 1);
    const hanNop = future.toISOString().slice(0, 10);

    const req = {
      body: {
        viTri: "Dev",
        mucLuong: "15-20tr",
        kinhNghiem: "1 năm",
        yeuCauKyNang: "JS",
        yeuCauBangCap: "ĐH",
        moTaCongViec: "Mô tả",
        hanNop,
      },
      user: { id: 7, vaiTro: "Manager" },
    };
    const res = mockRes();

    await recruitmentController.createJob(req, res);

    expect(Recruitment.create).toHaveBeenCalledWith(
      expect.objectContaining({
        viTri: "Dev",
        moTaCongViec: "Mô tả",
        hanNop,
        nguoiDangID: 7,
      })
    );

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: "Đăng tin tuyển dụng thành công",
      jobId: 123,
    });
  });
});
