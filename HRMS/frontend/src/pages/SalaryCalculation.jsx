import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { DollarSign, Calendar, TrendingUp, TrendingDown, Award, AlertTriangle } from 'lucide-react'; // Thêm icon

const SalaryCalculation = () => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        employeeId: '',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear()
    });
    const [employees, setEmployees] = useState([]);
    const [salaryResult, setSalaryResult] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            const response = await api.get('/employees');
            setEmployees(response.data);
        } catch (error) {
            console.error('Error fetching employees:', error);
        }
    };

    const handleCalculate = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/salary/calculate/${formData.employeeId}/${formData.month}/${formData.year}`);
            setSalaryResult(response.data);
        } catch (error) {
            alert('Lỗi tính lương: ' + error.response?.data?.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            await api.post(`/salary/save/${formData.employeeId}/${formData.month}/${formData.year}`);
            alert('Lưu bảng lương thành công');
        } catch (error) {
            alert('Lỗi lưu: ' + error.response?.data?.message);
        }
    };

    const formatCurrency = (value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Tính lương nhân viên</h1>
            <p className="text-gray-600 mb-8">Tính lương theo quy định Việt Nam dựa trên chấm công và nghỉ phép</p>

            <div className="card mb-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Nhân viên</label>
                        <select
                            value={formData.employeeId}
                            onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                            className="input-field"
                        >
                            <option value="">-- Chọn nhân viên --</option>
                            {employees.map(emp => (
                                <option key={emp.MaNhanVien} value={emp.MaNhanVien}>
                                    {emp.HoTen} ({emp.MaNhanVien})
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tháng</label>
                        <select
                            value={formData.month}
                            onChange={(e) => setFormData({ ...formData, month: e.target.value })}
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
                            value={formData.year}
                            onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                            className="input-field"
                            min="2020"
                        />
                    </div>
                </div>
                <div className="mt-4">
                    <button
                        onClick={handleCalculate}
                        disabled={loading || !formData.employeeId}
                        className="btn-primary mr-4"
                    >
                        {loading ? 'Đang tính...' : 'Tính lương'}
                    </button>
                    {salaryResult && (
                        <button onClick={handleSave} className="btn-secondary">
                            Lưu bảng lương
                        </button>
                    )}
                </div>
            </div>

            {salaryResult && (
                <div className="card bg-white shadow-lg rounded-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6">
                        <h2 className="text-2xl font-bold flex items-center">
                            <DollarSign size={28} className="mr-3" />
                            Bảng lương chi tiết
                        </h2>
                        <p className="text-blue-100 mt-1">Tháng {formData.month}/{formData.year}</p>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* Thông tin cơ bản */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                                <Calendar size={20} className="mr-2 text-gray-600" />
                                Thông tin cơ bản
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center justify-between p-3 bg-white rounded border">
                                    <span className="font-medium text-gray-700">Lương cơ bản:</span>
                                    <span className="text-lg font-bold text-gray-900">{formatCurrency(salaryResult.baseSalary)}</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-white rounded border">
                                    <span className="font-medium text-gray-700">Ngày công thực tế:</span>
                                    <span className="text-lg font-bold text-gray-900">{salaryResult.actualWorkingDays}/26</span>
                                </div>
                            </div>
                        </div>

                        {/* Thu nhập */}
                        <div className="bg-green-50 rounded-lg p-4">
                            <h3 className="text-lg font-semibold text-green-800 mb-3 flex items-center">
                                <TrendingUp size={20} className="mr-2" />
                                Thu nhập
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 bg-white rounded border border-green-200">
                                    <span className="font-medium text-gray-700">Lương thực tế:</span>
                                    <span className="text-lg font-bold text-green-600">{formatCurrency(salaryResult.grossSalary)}</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-white rounded border border-green-200">
                                    <span className="font-medium text-gray-700">Thưởng:</span>
                                    <span className="text-lg font-bold text-green-600">{formatCurrency(salaryResult.totalReward)}</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-white rounded border border-green-200">
                                    <span className="font-medium text-gray-700">Phạt:</span>
                                    <span className="text-lg font-bold text-red-600">-{formatCurrency(salaryResult.totalPenalty)}</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-green-100 rounded border-2 border-green-300">
                                    <span className="font-semibold text-gray-800">Tổng thu nhập:</span>
                                    <span className="text-xl font-bold text-green-700">{formatCurrency(salaryResult.grossSalary + salaryResult.totalReward - salaryResult.totalPenalty)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Khấu trừ */}
                        <div className="bg-red-50 rounded-lg p-4">
                            <h3 className="text-lg font-semibold text-red-800 mb-3 flex items-center">
                                <TrendingDown size={20} className="mr-2" />
                                Khấu trừ
                            </h3>
                            <div className="flex items-center justify-between p-3 bg-white rounded border border-red-200">
                                <span className="font-medium text-gray-700">Bảo hiểm (10.5% lương CB):</span>
                                <span className="text-lg font-bold text-red-600">-{formatCurrency(salaryResult.totalDeductions)}</span>
                            </div>
                        </div>

                        {/* Tổng kết */}
                        <div className="bg-yellow-50 rounded-lg p-4 border-2 border-yellow-300">
                            <h3 className="text-lg font-semibold text-yellow-800 mb-3 flex items-center">
                                <Award size={20} className="mr-2" />
                                Tổng kết
                            </h3>
                            <div className="flex items-center justify-between p-4 bg-yellow-100 rounded border border-yellow-400">
                                <span className="text-xl font-semibold text-gray-800">Thực lãnh:</span>
                                <span className="text-2xl font-bold text-yellow-700">{formatCurrency(salaryResult.netSalary)}</span>
                            </div>
                        </div>

                        {salaryResult.note && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
                                <AlertTriangle size={20} className="text-red-600 mr-3" />
                                <p className="text-red-700 font-medium">{salaryResult.note}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SalaryCalculation;