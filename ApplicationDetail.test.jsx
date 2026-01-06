import { render, screen, fireEvent, act, within } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import ApplicationDetail from "../pages/ApplicationDetail";
import api from "../services/api";

// ===== MOCK API =====
jest.mock("../services/api", () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
}));

// ===== MOCK react-router-dom =====
jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => jest.fn(),
  };
});

// ===== MOCK alert =====
beforeAll(() => {
  window.alert = jest.fn();
  window.confirm = jest.fn().mockReturnValue(true);
});

// ===== MOCK dữ liệu =====
const mockApplication = {
  HoTen: "Nguyen Van A",
  TrangThai: "Moi",
  ViTri: "Frontend Developer",
  Email: "nguyenvana@example.com",
  SoDienThoai: "0123456789",
  NgayNop: "2026-01-01",
  MaHoSo: "HS001",
  DuongDanCV: "/cv.pdf",
};

const mockNotes = [
  {
    MaGhiChu: 1,
    NoiDung: "Ứng viên có kỹ năng tốt",
    ThoiGian: "2026-01-02T10:00:00",
    NguoiCapNhat: "Admin",
  },
];

// ===== RESET MOCK trước mỗi test =====
beforeEach(() => {
  jest.clearAllMocks();
  api.get.mockResolvedValue({
    data: { application: mockApplication, notes: mockNotes },
  });
  api.put.mockResolvedValue({ data: { success: true } });
  api.post.mockResolvedValue({ data: { success: true } });
});

describe("ApplicationDetail Component", () => {
  const renderComponent = () =>
    render(
      <MemoryRouter initialEntries={["/applications/1"]}>
        <Routes>
          <Route path="/applications/:id" element={<ApplicationDetail />} />
          <Route
            path="/recruitment/management"
            element={<div>Management Page</div>}
          />
        </Routes>
      </MemoryRouter>
    );

  it("hiển thị thông tin ứng viên", async () => {
    await act(async () => {
      renderComponent();
    });

    const personalInfoCardTitle = await screen.findByText("Nguyen Van A");
    expect(personalInfoCardTitle).toBeInTheDocument();

    const personalInfoCard = personalInfoCardTitle.closest(".card");
    expect(
      within(personalInfoCard).getByText("Frontend Developer")
    ).toBeInTheDocument();
    expect(
      within(personalInfoCard).getByText("nguyenvana@example.com")
    ).toBeInTheDocument();
    expect(
      within(personalInfoCard).getByText("0123456789")
    ).toBeInTheDocument();
    expect(within(personalInfoCard).getByText("HS001")).toBeInTheDocument();
    expect(within(personalInfoCard).getByText("1/1/2026")).toBeInTheDocument();

    const jobInfoCard = screen
      .getByText("Thông tin vị trí ứng tuyển")
      .closest(".card");
    expect(
      within(jobInfoCard).getByText("Frontend Developer")
    ).toBeInTheDocument();
  });

  it("cập nhật trạng thái gọi API đúng", async () => {
    await act(async () => {
      renderComponent();
    });

    await screen.findByText("Nguyen Van A");

    const select = screen.getByRole("combobox");
    fireEvent.change(select, { target: { value: "PhongVan" } });

    const saveButton = screen.getByRole("button", { name: /Cập nhật/i });

    await act(async () => {
      fireEvent.click(saveButton);
    });

    expect(api.put).toHaveBeenCalledWith("/recruitment/applications/1/status", {
      status: "PhongVan",
    });
  });

  it("hiển thị alert khi cập nhật trạng thái lỗi", async () => {
    api.put.mockRejectedValueOnce(new Error("API error"));

    await act(async () => {
      renderComponent();
    });

    await screen.findByText("Nguyen Van A");

    const select = screen.getByRole("combobox");
    fireEvent.change(select, { target: { value: "PhongVan" } });

    const saveButton = screen.getByRole("button", { name: /Cập nhật/i });

    await act(async () => {
      fireEvent.click(saveButton);
    });

    expect(window.alert).toHaveBeenCalledWith("Có lỗi xảy ra");
  });

  it("bấm nút Tải CV", async () => {
    const openSpy = jest.spyOn(window, "open").mockImplementation(() => {});

    await act(async () => {
      renderComponent();
    });

    await screen.findByText("Nguyen Van A");

    fireEvent.click(screen.getByRole("button", { name: /Tải CV/i }));

    expect(openSpy).toHaveBeenCalledWith(
      "http://localhost:5000/cv.pdf",
      "_blank"
    );

    openSpy.mockRestore();
  });
});
