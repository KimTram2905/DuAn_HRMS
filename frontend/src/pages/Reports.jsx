// pages/Reports.jsx - NOTE: U5.1, U5.2, U5.3 - Tạo báo cáo
import { useState, useEffect } from 'react';
import { FileText, Download, RotateCcw, Search, TrendingUp, TrendingDown } from 'lucide-react';
import {
    BarChart, Bar, PieChart, Pie, LineChart, Line,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell, ResponsiveContainer
} from 'recharts';
import api from '../services/api';

const Reports = () => {
    const [filters, setFilters] = useState({
        reportType: 'NhanSu',
        phongBan: '',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear()
    });
    const [departments, setDepartments] = useState([]);
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [exporting, setExporting] = useState(false);

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];

    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        try {
            const response = await api.get('/employees/data/departments');
            setDepartments(response.data);
        } catch (error) {
            console.error('Error fetching departments:', error);
        }
    };

    const fetchReport = async () => {
        setLoading(true);
        try {
            let endpoint = '';
            const params = {
                phongBan: filters.phongBan,
                month: filters.month,
                year: filters.year
            };

            switch (filters.reportType) {
                case 'NhanSu':
                    endpoint = '/reports/employee';
                    break;
                case 'ChamCong':
                    endpoint = '/reports/attendance';
                    if (!filters.phongBan) {
                        alert('Vui lòng chọn phòng ban cho báo cáo chấm công');
                        setLoading(false);
                        return;
                    }
                    break;
                case 'Luong':
                    endpoint = '/reports/salary';
                    break;
                default:
                    break;
            }

            const response = await api.get(endpoint, { params });
            setReportData(response.data);
        } catch (error) {
            alert(error.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async (format) => {
        setExporting(true);
        try {
            const params = {
                type: filters.reportType,
                phongBan: filters.phongBan,
                month: filters.month,
                year: filters.year
            };

            const endpoint = format === 'excel' ? '/reports/export/excel' : '/reports/export/pdf';
            const response = await api.get(endpoint, { params });

            // Download file
            window.open(`http://localhost:5000${response.data.downloadUrl}`, '_blank');
            alert('Xuất báo cáo thành công');
        } catch (error) {
            alert(error.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setExporting(false);
        }
    };

    const handleReset = () => {
        setFilters({
            reportType: 'NhanSu',
            phongBan: '',
            month: new Date().getMonth() + 1,
            year: new Date().getFullYear()
        });
        setReportData([]);
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(value);
    };

    // Render biểu đồ theo loại báo cáo
    const renderChart = () => {
        if (reportData.length === 0) return null;

        switch (filters.reportType) {
            case 'NhanSu':
                return (
                    <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={reportData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="TenPhongBan" angle={-45} textAnchor="end" height={100} />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="SoNhanVien" fill="#0088FE" name="Số nhân viên" />
                        </BarChart>
                    </ResponsiveContainer>
                );

            case 'ChamCong':
                return (
                    <ResponsiveContainer width="100%" height={350}>
                        <LineChart data={reportData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="NhanVien" angle={-45} textAnchor="end" height={100} />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="TongGioLam" stroke="#8884d8" name="Tổng giờ làm" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                );

            case 'Luong':
                // Lọc và ép kiểu TongQuyLuong thành số
                const salaryData = reportData
                    .filter(item => parseFloat(item.TongQuyLuong) > 0)
                    .map(item => ({
                        ...item,
                        TongQuyLuong: parseFloat(item.TongQuyLuong),  // Ép kiểu để đảm bảo là số
                        SoVoiThangTruoc: parseFloat(item.SoVoiThangTruoc) || 0  // Nếu cần, ép kiểu cho SoVoiThangTruoc
                    }));
                
                if (salaryData.length === 0) {
                    return (
                        <div className="text-center py-12 bg-gray-50 rounded-lg">
                            <p className="text-gray-500">Không có dữ liệu lương trong kỳ này</p>
                        </div>
                    );
                }

                const totalSalary = salaryData.reduce((sum, item) => sum + item.TongQuyLuong, 0);

                return (
                    <ResponsiveContainer width="100%" height={350}>
                        <PieChart>
                            <Pie
                                data={salaryData}
                                cx="50%"
                                cy="50%"
                                labelLine={true}
                                label={(entry) => {
                                    const percent = ((entry.TongQuyLuong / totalSalary) * 100).toFixed(1);
                                    return `${entry.TenPhongBan}: ${percent}%`;
                                }}
                                outerRadius={120}
                                fill="#8884d8"
                                dataKey="TongQuyLuong"
                            >
                                {salaryData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value) => formatCurrency(value)} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                );

            default:
                return null;
        }
    };

    // Render bảng dữ liệu
    const renderTable = () => {
        if (reportData.length === 0) return null;

        switch (filters.reportType) {
            case 'NhanSu':
                return (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-blue-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phòng ban</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Số nhân viên</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nam</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nữ</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Độ tuổi TB</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {reportData.map((row, idx) => (
                                <tr key={idx} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{row.TenPhongBan}</td>
                                    <td className="px-6 py-4 text-sm text-gray-900">{row.SoNhanVien}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{row.SoNam}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{row.SoNu}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{row.DoTuoiTrungBinh}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                );

            case 'ChamCong':
                return (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-yellow-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nhân viên</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tổng giờ làm</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày nghỉ</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Đi muộn (lần)</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {reportData.map((row, idx) => (
                                <tr key={idx} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{row.NhanVien}</td>
                                    <td className="px-6 py-4 text-sm text-gray-900">{row.TongGioLam}h</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{row.NgayNghi}</td>
                                    <td className="px-6 py-4 text-sm text-red-600">{row.DiMuon}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                );

            case 'Luong':
                return (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-green-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phòng ban</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tổng quỹ lương (VND)</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">So với tháng trước (%)</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {reportData.map((row, idx) => (
                                <tr key={idx} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{row.TenPhongBan}</td>
                                    <td className="px-6 py-4 text-sm font-bold text-gray-900">{formatCurrency(row.TongQuyLuong)}</td>
                                    <td className="px-6 py-4 text-sm">
                                        <span className={`inline-flex items-center ${row.SoVoiThangTruoc >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {row.SoVoiThangTruoc >= 0 ? <TrendingUp size={16} className="mr-1" /> : <TrendingDown size={16} className="mr-1" />}
                                            {Math.abs(row.SoVoiThangTruoc)}%
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                );

            default:
                return null;
        }
    };

    return (
        <div className="p-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-1 flex items-center">
                    Báo cáo
                </h1>
                <p className="text-gray-600">Tạo và xem các báo cáo nhân sự, chấm công, lương</p>
            </div>

            {/* Filters */}
            <div className="card mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Bộ lọc báo cáo</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Loại báo cáo</label>
                        <select
                            value={filters.reportType}
                            onChange={(e) => setFilters({ ...filters, reportType: e.target.value })}
                            className="input-field"
                        >
                            <option value="NhanSu">Báo cáo Nhân sự</option>
                            <option value="ChamCong">Báo cáo Chấm công</option>
                            <option value="Luong">Báo cáo Lương</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phòng ban {filters.reportType === 'ChamCong' && <span className="text-red-500">*</span>}
                        </label>
                        <select
                            value={filters.phongBan}
                            onChange={(e) => setFilters({ ...filters, phongBan: e.target.value })}
                            className="input-field"
                        >
                            <option value="">Tất cả phòng ban</option>
                            {departments.map(dept => (
                                <option key={dept.MaPhongBan} value={dept.MaPhongBan}>
                                    {dept.TenPhongBan}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tháng</label>
                        <select
                            value={filters.month}
                            onChange={(e) => setFilters({ ...filters, month: e.target.value })}
                            className="input-field"
                        >
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
                            min="2020"
                            max="2030"
                        />
                    </div>
                </div>

                <div className="flex gap-3 mt-6">
                    <button
                        onClick={fetchReport}
                        disabled={loading}
                        className="btn-primary disabled:opacity-50"
                    >
                        <Search size={18} className="mr-2 inline" />
                        {loading ? 'Đang tải...' : 'Xem báo cáo'}
                    </button>
                    <button onClick={handleReset} className="btn-secondary">
                        <RotateCcw size={18} className="mr-2 inline" />
                        Đặt lại
                    </button>
                </div>
            </div>

            {/* Report Content */}
            {reportData.length > 0 && (
                <>
                    {/* Export Buttons */}
                    <div className="card mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-gray-800">Xuất báo cáo</h3>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => handleExport('excel')}
                                    disabled={exporting}
                                    className="btn-primary disabled:opacity-50"
                                >
                                    <Download size={18} className="mr-2 inline" />
                                    Xuất Excel
                                </button>
                                <button
                                    onClick={() => handleExport('pdf')}
                                    disabled={exporting}
                                    className="btn-secondary disabled:opacity-50"
                                >
                                    <Download size={18} className="mr-2 inline" />
                                    Xuất PDF
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Chart */}
                    <div className="card mb-6">
                        <h3 className="text-xl font-semibold text-gray-800 mb-6">Biểu đồ</h3>
                        {renderChart()}
                    </div>

                    {/* Table */}
                    <div className="card">
                        <h3 className="text-xl font-semibold text-gray-800 mb-6">Dữ liệu chi tiết</h3>
                        <div className="overflow-x-auto">
                            {renderTable()}
                        </div>
                    </div>
                </>
            )}

            {/* Empty State */}
            {!loading && reportData.length === 0 && (
                <div className="card text-center py-12">
                    <FileText size={48} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500 text-lg">Chọn bộ lọc và nhấn "Xem báo cáo" để hiển thị dữ liệu</p>
                </div>
            )}
        </div>
    );
};

export default Reports;