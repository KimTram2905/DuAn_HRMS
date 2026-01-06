import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SalaryView from "../pages/SalaryView";
import api from "../services/api";

// ================= MOCK API =================

jest.mock("../services/api");

api.get.mockResolvedValue({
  data: [
    { id: 1, name: "Nguyen Van A", salary: 1000 },
    { id: 2, name: "Tran Thi B", salary: 1200 },
  ],
});

// ================= MOCK AUTH =================
jest.mock("../contexts/AuthContext", () => ({
  useAuth: () => ({
    user: {
      maNhanVien: "NV01",
    },
  }),
}));

// ================= SETUP =================
beforeEach(() => {
  jest.clearAllMocks();
  window.alert = jest.fn();
});

// ================= MOCK DATA =================
const mockSalaries = [
  {
    Thang: 10,
    Nam: 2024,
    LuongCoBan: 10000000,
    Thuong: 2000000,
    Phat: 500000,
    TongThuNhap: 12000000,
    KhauTru: 1260000,
  },
];

describe("SalaryView Component", () => {
  it("hiển thị loading spinner ban đầu", () => {
    api.get.mockReturnValue(new Promise(() => {})); // pending

    render(<SalaryView />);

    expect(document.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("gọi API lấy bảng lương", async () => {
    api.get.mockResolvedValue({ data: mockSalaries });

    render(<SalaryView />);

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith("/salary/NV01", { params: {} });
    });
  });

  it("render tiêu đề trang", async () => {
    api.get.mockResolvedValue({ data: mockSalaries });

    render(<SalaryView />);

    expect(await screen.findByText("Bảng lương cá nhân")).toBeInTheDocument();
    expect(
      screen.getByText("Xem lịch sử bảng lương của bạn")
    ).toBeInTheDocument();
  });

  it("hiển thị bảng lương khi có dữ liệu", async () => {
    api.get.mockResolvedValue({ data: mockSalaries });

    render(<SalaryView />);

    expect(await screen.findByText("10/2024")).toBeInTheDocument();
    expect(screen.getByText("10.000.000 ₫")).toBeInTheDocument();
    expect(screen.getByText("2.000.000 ₫")).toBeInTheDocument();
  });

  it("hiển thị empty state khi không có dữ liệu", async () => {
    api.get.mockResolvedValue({ data: [] });

    render(<SalaryView />);

    expect(
      await screen.findByText("Không có dữ liệu bảng lương phù hợp")
    ).toBeInTheDocument();
  });

  it("áp dụng bộ lọc sẽ gọi API với params", async () => {
    api.get.mockResolvedValue({ data: mockSalaries });

    render(<SalaryView />);

    const [monthSelect] = screen.getAllByRole("combobox");

    fireEvent.change(monthSelect, {
      target: { value: "10" },
    });

    fireEvent.change(screen.getByPlaceholderText("Nhập năm"), {
      target: { value: "2024" },
    });

    fireEvent.click(screen.getByText("Áp dụng"));

    await waitFor(() => {
      expect(api.get).toHaveBeenLastCalledWith("/salary/NV01", {
        params: { month: "10", year: "2024" },
      });
    });
  });

  it("reset bộ lọc sẽ gọi API không params", async () => {
    api.get.mockResolvedValue({ data: mockSalaries });

    render(<SalaryView />);

    fireEvent.click(await screen.findByText("Đặt lại"));

    await waitFor(() => {
      expect(api.get).toHaveBeenLastCalledWith("/salary/NV01", {
        params: {},
      });
    });
  });

  it("API lỗi sẽ hiển thị alert", async () => {
    api.get.mockRejectedValue(new Error("API error"));

    render(<SalaryView />);

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith("Không thể tải bảng lương");
    });
  });
});
