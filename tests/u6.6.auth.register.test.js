const { mockRes } = require("./helpers");

jest.mock("../models/User", () => ({
  register: jest.fn(),
}));

const User = require("../models/User");
const authController = require("../controllers/authController");

describe("U6.6 - register", () => {
  beforeAll(() => {
    process.env.JWT_SECRET = "jest_test_secret";
  });

  beforeEach(() => jest.clearAllMocks());

  test("Thiếu thông tin bắt buộc -> 400", async () => {
    const req = {
      body: { username: "u", email: "a@b.com" }, // thiếu nhiều field
    };
    const res = mockRes();

    await authController.register(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Vui lòng điền đầy đủ thông tin" });
  });

  test("Confirm password không khớp -> 400", async () => {
    const req = {
      body: {
        username: "user1",
        email: "user1@gmail.com",
        password: "12345678",
        confirmPassword: "12345679",
        hoTen: "User 1",
        soDienThoai: "0123456789",
      },
    };
    const res = mockRes();

    await authController.register(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Mật khẩu xác nhận không khớp" });
  });

  test("Password < 8 ký tự -> 400", async () => {
    const req = {
      body: {
        username: "user1",
        email: "user1@gmail.com",
        password: "123",
        confirmPassword: "123",
        hoTen: "User 1",
        soDienThoai: "0123456789",
      },
    };
    const res = mockRes();

    await authController.register(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Mật khẩu phải có ít nhất 8 ký tự" });
  });

  test("Email sai định dạng -> 400", async () => {
    const req = {
      body: {
        username: "user1",
        email: "sai-email",
        password: "12345678",
        confirmPassword: "12345678",
        hoTen: "User 1",
        soDienThoai: "0123456789",
      },
    };
    const res = mockRes();

    await authController.register(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Email không hợp lệ" });
  });

  test("SĐT sai định dạng -> 400", async () => {
    const req = {
      body: {
        username: "user1",
        email: "user1@gmail.com",
        password: "12345678",
        confirmPassword: "12345678",
        hoTen: "User 1",
        soDienThoai: "12345", // sai
      },
    };
    const res = mockRes();

    await authController.register(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Số điện thoại không hợp lệ (10-11 số, bắt đầu bằng 0)",
    });
  });

  test("Đăng ký thành công -> 201 + token + user", async () => {
    User.register.mockResolvedValue({
      userId: 99,
      username: "user1",
      email: "user1@gmail.com",
      hoTen: "User 1",
      vaiTro: "Candidate",
      soDienThoai: "0123456789",
    });

    const req = {
      body: {
        username: "user1",
        email: "user1@gmail.com",
        password: "12345678",
        confirmPassword: "12345678",
        hoTen: "User 1",
        soDienThoai: "0123456789",
      },
    };
    const res = mockRes();

    await authController.register(req, res);

    expect(User.register).toHaveBeenCalledWith({
      username: "user1",
      email: "user1@gmail.com",
      password: "12345678",
      hoTen: "User 1",
      soDienThoai: "0123456789",
    });

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Đăng ký tài khoản ứng viên thành công",
        token: expect.any(String),
        user: expect.objectContaining({
          id: 99,
          username: "user1",
          email: "user1@gmail.com",
          hoTen: "User 1",
          vaiTro: "Candidate",
          soDienThoai: "0123456789",
        }),
      })
    );
  });
});
