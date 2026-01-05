import { useState, useEffect } from 'react';
import { DollarSign, Calendar, Filter, Search } from 'lucide-react'; // Thêm Search icon
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const SalaryView = () => {
    const { user } = useAuth();
    const [salaries, setSalaries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        month: '',
        year: ''
    });
    const [appliedFilters, setAppliedFilters] = useState({}); // State để lưu bộ lọc đã áp dụng

    useEffect(() => {
        fetchSalaries();
    }, [appliedFilters]); // Chỉ fetch khi appliedFilters thay đổi

    const fetchSalaries = async () => {
        try {
            setLoading(true);
            const params = {};
            if (appliedFilters.month) params.month = appliedFilters.month;
            if (appliedFilters.year) params.year = appliedFilters.year;

            const response = await api.get(`/salary/${user.maNhanVien}`, { params });
            setSalaries(response.data);
        } catch (error) {
            console.error('Error fetching salaries:', error);
            alert('Không thể tải bảng lương');
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        setAppliedFilters({ ...filters }); // Áp dụng bộ lọc
    };

    const resetFilters = () => {
        setFilters({ month: '', year: '' });
        setAppliedFilters({}); // Reset applied filters
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(value);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="p-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center">
                    Bảng lương cá nhân
                </h1>
                <p className="text-gray-600">Xem lịch sử bảng lương của bạn</p>
            </div>

            {/* Filters */}
            <div className="card mb-6">
                <div className="flex items-center mb-4">
                    <Filter size={20} className="mr-2 text-gray-600" />
                    <h2 className="text-lg font-semibold text-gray-800">Bộ lọc</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tháng</label>
                        <select
                            value={filters.month}
                            onChange={(e) => setFilters({ ...filters, month: e.target.value })}
                            className="input-field"
                        >
                            <option value="">Tất cả tháng</option>
                            {Array.from({ length: 12 }, (_, i) => (
                                <option key={i + 1} value={i + 1}>Tháng {i + 1}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Năm</label>
                        <input
                            type="number"
                            value={filters.year}
                            onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                            className="input-field"
                            placeholder="Nhập năm"
                            min="2020"
                            max="2030"
                        />
                    </div>
                    <div>
                        <button
                            onClick={applyFilters}
                            className="btn-primary w-full flex items-center justify-center"
                        >
                            <Search size={18} className="mr-2" />
                            Áp dụng
                        </button>
                    </div>
                    <div>
                        <button
                            onClick={resetFilters}
                            className="btn-secondary w-full"
                        >
                            Đặt lại
                        </button>
                    </div>
                </div>
            </div>

            {/* Salary Table */}
            <div className="card">
                <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-3 border-b flex items-center">
                    <Calendar size={24} className="mr-2 text-blue-600" />
                    Lịch sử bảng lương
                </h2>

                {salaries.length === 0 ? (
                    <div className="text-center py-12">
                        <DollarSign size={48} className="mx-auto text-gray-300 mb-3" />
                        <p className="text-gray-500 text-lg">Không có dữ liệu bảng lương phù hợp</p>
                        <p className="text-gray-400">Hãy kiểm tra bộ lọc hoặc liên hệ quản lý nếu cần</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-green-100">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tháng/Năm</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lương cơ bản</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thưởng</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phạt</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tổng thu nhập</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Khấu trừ</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thực lãnh</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {salaries.map((salary) => (
                                    <tr key={`${salary.Thang}-${salary.Nam}`} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {salary.Thang}/{salary.Nam}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formatCurrency(salary.LuongCoBan)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                                            {formatCurrency(salary.Thuong)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                                            -{formatCurrency(salary.Phat)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {formatCurrency(salary.TongThuNhap)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                                            -{formatCurrency(salary.KhauTru)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600">
                                            {formatCurrency(salary.TongThuNhap - salary.KhauTru)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Note */}
            <div className="mt-6 card bg-blue-50 border border-blue-200">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <DollarSign className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="ml-3">
                        <p className="text-sm text-blue-800">
                            Bảng lương được tính dựa trên lương cơ bản, ngày công, thưởng/phạt và khấu trừ bảo hiểm (10.5%).
                            Nếu có thắc mắc, vui lòng liên hệ quản lý phòng ban.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SalaryView;