import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SalaryCalculation from "../pages/SalaryCalculation";
import api from "../services/api";

/* ================= MOCK API ================= */
jest.mock("../services/api");

/* ================= MOCK AUTH ================= */
jest.mock("../contexts/AuthContext", () => ({
  useAuth: () => ({
    user: { role: "ADMIN" },
  }),
}));

/* ================= SETUP ================= */
beforeEach(() => {
  jest.clearAllMocks();
  window.alert = jest.fn();
});

/* ================= MOCK DATA ================= */
const mockEmployees = [{ MaNhanVien: "NV01", HoTen: "Nguyễn Văn A" }];

const mockSalaryResult = {
  baseSalary: 10000000,
  actualWorkingDays: 26,
  grossSalary: 10000000,
  totalReward: 2000000,
  totalPenalty: 500000,
  totalDeductions: 1050000,
  netSalary: 10450000,
  note: "Nghỉ không phép 1 ngày",
};

/* ================= HELPER ================= */
const renderComponent = async () => {
  api.get.mockResolvedValueOnce({ data: mockEmployees }); // fetchEmployees
  render(<SalaryCalculation />);
  // đợi select có option value "NV01"
  await waitFor(() =>
    expect(
      screen.getByRole("option", { name: /Nguyễn Văn A/ })
    ).toBeInTheDocument()
  );
};

describe("SalaryCalculation Component", () => {
  it("render tiêu đề trang", async () => {
    await renderComponent();
    expect(screen.getByText("Tính lương nhân viên")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Tính lương theo quy định Việt Nam dựa trên chấm công và nghỉ phép"
      )
    ).toBeInTheDocument();
  });

  it("disable nút Tính lương khi chưa chọn nhân viên", async () => {
    await renderComponent();
    expect(screen.getByTestId("calculate-salary-btn")).toBeDisabled();
  });

  it("tính lương thành công và hiển thị kết quả", async () => {
    await renderComponent();
    api.get.mockResolvedValueOnce({ data: mockSalaryResult });

    fireEvent.change(screen.getByLabelText("Nhân viên"), {
      target: { value: "NV01" },
    });

    fireEvent.click(screen.getByTestId("calculate-salary-btn"));

    expect(await screen.findByText("Bảng lương chi tiết")).toBeInTheDocument();
    expect(screen.getByText(/Nghỉ không phép 1 ngày/)).toBeInTheDocument();
    expect(screen.getByText(/10.450.000/)).toBeInTheDocument();
  });

  it("gọi API lưu bảng lương khi nhấn Lưu", async () => {
    await renderComponent();
    api.get.mockResolvedValueOnce({ data: mockSalaryResult });
    api.post.mockResolvedValueOnce({});

    fireEvent.change(screen.getByLabelText("Nhân viên"), {
      target: { value: "NV01" },
    });

    fireEvent.click(screen.getByTestId("calculate-salary-btn"));
    const saveBtn = await screen.findByTestId("save-salary-btn");
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        "/salary/save/NV01/1/2026" || expect.any(String)
      );
    });
    expect(window.alert).toHaveBeenCalledWith("Lưu bảng lương thành công");
  });

  it("hiển thị alert khi API tính lương lỗi", async () => {
    await renderComponent();
    api.get.mockRejectedValueOnce({
      response: { data: { message: "Lỗi tính lương" } },
    });

    fireEvent.change(screen.getByLabelText("Nhân viên"), {
      target: { value: "NV01" },
    });

    fireEvent.click(screen.getByTestId("calculate-salary-btn"));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(
        "Lỗi tính lương: Lỗi tính lương"
      );
    });
  });
});
