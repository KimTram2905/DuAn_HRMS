import { useState, useEffect } from 'react';
import { FileSpreadsheet, FileText } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const SalaryManagement = () => {
    const { user } = useAuth();

    const [salaries, setSalaries] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(false);

    const [filters, setFilters] = useState({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        phongBan: ''
    });

    const isManager = user?.vaiTro === 'Manager';

    /* ================= FETCH ================= */
    useEffect(() => {
        if (!isManager) fetchDepartments();
    }, []);

    useEffect(() => {
        fetchSalaries();
    }, [filters]);

    const fetchDepartments = async () => {
        try {
            const res = await api.get('/employees/data/departments');
            setDepartments(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchSalaries = async () => {
        try {
            setLoading(true);
            const res = await api.get('/salary', { params: filters });
            setSalaries(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    /* ================= EXPORT ================= */
    const exportFile = async (type) => {
        if (salaries.length === 0) {
            alert('Không có dữ liệu để xuất');
            return;
        }

        try {
            const res = await api.get(`/salary/export/${type}`, {
                params: filters,
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.download = `BangLuong_${filters.month}_${filters.year}.${type === 'excel' ? 'xlsx' : 'pdf'}`;
            link.click();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            alert(err.response?.data?.message || 'Xuất file thất bại');
        }
    };

    /* ================= HELPERS ================= */
    const formatCurrency = (value) =>
        new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(value || 0);

    const sumField = (field) =>
        salaries.reduce((sum, s) => sum + Number(s[field] || 0), 0);

    /* ================= RENDER ================= */
    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-2">Xuất bảng lương</h1>
            <p className="text-gray-600 mb-6">
                {isManager
                    ? 'Quản lý bảng lương phòng ban của bạn'
                    : 'Quản lý bảng lương toàn hệ thống'}
            </p>

            {/* ===== FILTER ===== */}
            <div className="card mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="label">Tháng</label>
                        <select
                            className="input-field"
                            value={filters.month}
                            onChange={(e) =>
                                setFilters({ ...filters, month: e.target.value })
                            }
                        >
                            {Array.from({ length: 12 }, (_, i) => (
                                <option key={i + 1} value={i + 1}>
                                    Tháng {i + 1}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="label">Năm</label>
                        <input
                            type="number"
                            className="input-field"
                            value={filters.year}
                            onChange={(e) =>
                                setFilters({ ...filters, year: e.target.value })
                            }
                        />
                    </div>

                    {!isManager && (
                        <div>
                            <label className="label">Phòng ban</label>
                            <select
                                className="input-field"
                                value={filters.phongBan}
                                onChange={(e) =>
                                    setFilters({ ...filters, phongBan: e.target.value })
                                }
                            >
                                <option value="">Tất cả</option>
                                {departments.map((d) => (
                                    <option key={d.MaPhongBan} value={d.MaPhongBan}>
                                        {d.TenPhongBan}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>
            </div>

            {/* ===== ACTION ===== */}
            <div className="flex justify-between mb-4">
                <h2 className="text-xl font-semibold">
                    Bảng lương {filters.month}/{filters.year}
                </h2>

                <div className="flex gap-3">
                    <button
                        className="btn-primary flex items-center"
                        onClick={() => exportFile('excel')}
                        disabled={salaries.length === 0}
                    >
                        <FileSpreadsheet className="mr-2" size={18} />
                        Excel
                    </button>
                    <button
                        className="btn-primary flex items-center"
                        onClick={() => exportFile('pdf')}
                        disabled={salaries.length === 0}
                    >
                        <FileText className="mr-2" size={18} />
                        PDF
                    </button>
                </div>
            </div>

            {/* ===== TABLE ===== */}
            {/* ===== TABLE ===== */}
<div className="card shadow-md rounded-xl overflow-hidden">
    {loading ? (
        <p className="text-center py-8 text-gray-500">Đang tải dữ liệu...</p>
    ) : salaries.length === 0 ? (
        <p className="text-center py-8 text-gray-500">
            Chưa có dữ liệu bảng lương
        </p>
    ) : (
        <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
                <thead className="bg-gradient-to-r from-blue-600 to-blue-500 text-white">
                    <tr>
                        {[
                            'Mã NV',
                            'Họ tên',
                            'Phòng ban',
                            'Chức vụ',
                            'Lương CB',
                            'Thưởng',
                            'Phạt',
                            'Tổng TN',
                            'Khấu trừ',
                            'Thực nhận'
                        ].map((h) => (
                            <th
                                key={h}
                                className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-center whitespace-nowrap"
                            >
                                {h}
                            </th>
                        ))}
                    </tr>
                </thead>

                <tbody className="divide-y divide-gray-100 text-sm">
                    {salaries.map((s, index) => {
                        const thucNhan = s.TongThuNhap - s.KhauTru;
                        return (
                            <tr
                                key={s.MaBangLuong}
                                className={`transition ${
                                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                                } hover:bg-blue-50`}
                            >
                                <td className="px-4 py-2 text-center font-medium">
                                    {s.MaNhanVien}
                                </td>
                                <td className="px-4 py-2 font-medium">
                                    {s.HoTen}
                                </td>
                                <td className="px-4 py-2">
                                    {s.TenPhongBan}
                                </td>
                                <td className="px-4 py-2">
                                    {s.TenChucVu}
                                </td>

                                <td className="px-4 py-2 text-right">
                                    {formatCurrency(s.LuongCoBan)}
                                </td>
                                <td className="px-4 py-2 text-right text-green-600 font-medium">
                                    {formatCurrency(s.Thuong)}
                                </td>
                                <td className="px-4 py-2 text-right text-red-600 font-medium">
                                    {formatCurrency(s.Phat)}
                                </td>
                                <td className="px-4 py-2 text-right font-semibold">
                                    {formatCurrency(s.TongThuNhap)}
                                </td>
                                <td className="px-4 py-2 text-right">
                                    {formatCurrency(s.KhauTru)}
                                </td>
                                <td className="px-4 py-2 text-right font-bold text-blue-600">
                                    {formatCurrency(thucNhan)}
                                </td>
                            </tr>
                        );
                    })}

                    {/* ===== TOTAL ===== */}
                    <tr className="bg-blue-50 border-t-2 border-blue-50 font-bold text-sm">
                        <td colSpan={4} className="text-center py-3 uppercase">
                            TỔNG CỘNG
                        </td>
                        <td className="text-right px-4">
                            {formatCurrency(sumField('LuongCoBan'))}
                        </td>
                        <td className="text-right px-4 text-green-700">
                            {formatCurrency(sumField('Thuong'))}
                        </td>
                        <td className="text-right px-4 text-red-700">
                            {formatCurrency(sumField('Phat'))}
                        </td>
                        <td className="text-right px-4">
                            {formatCurrency(sumField('TongThuNhap'))}
                        </td>
                        <td className="text-right px-4">
                            {formatCurrency(sumField('KhauTru'))}
                        </td>
                        <td className="text-right px-4 text-blue-700">
                            {formatCurrency(
                                sumField('TongThuNhap') - sumField('KhauTru')
                            )}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    )}
</div>

        </div>
    );
};

export default SalaryManagement;
