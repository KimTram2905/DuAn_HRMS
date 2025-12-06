import { useState, useEffect } from 'react';
import { Users, DollarSign, Calendar, UserPlus } from 'lucide-react';
import api from '../services/api';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
    PieChart, Pie, Cell, ResponsiveContainer, 
    LineChart, Line 
} from 'recharts';

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalEmployees: 0,
        totalSalary: 0,
        totalLeave: 0,
        newEmployees: [],
        employeesByDepartment: [],
        employeesByRole: [],
        attendanceStats: [] // Dùng cho biểu đồ chấm công theo phòng ban
    });
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ phongBan: '' });
    const [departments, setDepartments] = useState([]);

    useEffect(() => {
        fetchDepartments();
    }, []);

    useEffect(() => {
        fetchStats();
    }, [filters]);

    const fetchDepartments = async () => {
        try {
            const response = await api.get('/employees/data/departments');
            setDepartments(response.data);
        } catch (error) {
            console.error('Error fetching departments:', error);
        }
    };

    const fetchStats = async () => {
        try {
            setLoading(true);
            const response = await api.get('/dashboard/stats', { params: filters });
            setStats(response.data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

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
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard Tổng quan</h1>
                <p className="text-gray-600">Thống kê và báo cáo hệ thống nhân sự</p>
            </div>

            {/* Filter phòng ban */}
            <div className="card mb-8 p-6 bg-white rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">Bộ lọc nhanh</h2>
                <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phòng ban</label>
                        <select
                            value={filters.phongBan}
                            onChange={(e) => setFilters({ ...filters, phongBan: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Tất cả phòng ban</option>
                            {departments.map(dept => (
                                <option key={dept.MaPhongBan} value={dept.MaPhongBan}>
                                    {dept.TenPhongBan}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Thẻ thống kê */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-100 text-sm mb-1">Tổng số nhân viên</p>
                            <h3 className="text-3xl font-bold">{stats.totalEmployees}</h3>
                        </div>
                        <Users size={48} className="text-blue-200 opacity-80" />
                    </div>
                </div>

                <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-lg shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-green-100 text-sm mb-1">Tổng quỹ lương</p>
                            <h3 className="text-2xl font-bold">{formatCurrency(stats.totalSalary)}</h3>
                        </div>
                        <DollarSign size={48} className="text-green-200 opacity-80" />
                    </div>
                </div>

                <div className="card bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-lg shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-orange-100 text-sm mb-1">Số ngày nghỉ</p>
                            <h3 className="text-3xl font-bold">{stats.totalLeave}</h3>
                        </div>
                        <Calendar size={48} className="text-orange-200 opacity-80" />
                    </div>
                </div>

                <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-purple-100 text-sm mb-1">Nhân viên mới</p>
                            <h3 className="text-3xl font-bold">{stats.newEmployees.length}</h3>
                        </div>
                        <UserPlus size={48} className="text-purple-200 opacity-80" />
                    </div>
                </div>
            </div>

            {/* Biểu đồ nhân viên theo phòng ban */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div className="card p-6 bg-white rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4">Số nhân viên theo phòng ban</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={stats.employeesByDepartment}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="TenPhongBan" angle={-45} textAnchor="end" height={80} />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="SoLuong" fill="#0088FE" name="Số lượng" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="card p-6 bg-white rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4">Thống kê vai trò người dùng</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={stats.employeesByRole}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={(entry) => `${entry.TenVaiTro}: ${entry.SoLuong}`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="SoLuong"
                            >
                                {stats.employeesByRole.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Biểu đồ chấm công theo phòng ban */}
            <div className="card p-6 bg-white rounded-lg shadow mb-8">
                <h2 className="text-xl font-semibold mb-4">Chấm công theo phòng ban</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={stats.attendanceStats}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="TenPhongBan" />
                        <YAxis label={{ value: 'Tổng giờ làm', angle: -90, position: 'insideLeft' }} />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="TongGioLam" stroke="#8884d8" name="Tổng giờ làm" />
                        <Line type="monotone" dataKey="SoLanMuon" stroke="#82ca9d" name="Số lần muộn" />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Bảng nhân viên mới */}
            {stats.newEmployees.length > 0 && (
                <div className="card p-6 bg-white rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4">Nhân viên mới</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã NV</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Họ tên</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày bắt đầu</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {stats.newEmployees.map((emp) => (
                                    <tr key={emp.MaNhanVien}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{emp.MaNhanVien}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{emp.HoTen}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{emp.Email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(emp.NgayBatDauHopDong).toLocaleDateString('vi-VN')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
