import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const AttendanceManagement = () => {
    const { user } = useAuth();
    const [attendance, setAttendance] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [filters, setFilters] = useState({
        phongBan: '',
        filterMode: 'month',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        startDate: '',
        endDate: ''
    });
    const [formData, setFormData] = useState({
        nhanVienID: '',
        ngay: new Date().toISOString().split('T')[0],
        gioVao: '08:00',
        gioRa: '17:00'
    });
    const [editData, setEditData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);

    const isManager = user.vaiTro === 'Manager';

    useEffect(() => {
        fetchDepartments();
        if (isManager) fetchEmployeesByDepartment();
        fetchAttendance();
    }, [user, filters]);

    const fetchDepartments = async () => {
        try {
            const response = await api.get('/employees/data/departments');
            setDepartments(response.data);
        } catch (error) {
            console.error('Error fetching departments:', error);
        }
    };

    const fetchEmployeesByDepartment = async () => {
        try {
            const response = await api.get('/employees', { params: { phongBan: user.phongBanId } });
            setEmployees(response.data);
        } catch (error) {
            console.error('Error fetching employees:', error);
        }
    };

    const fetchAttendance = async () => {
        try {
            setLoading(true);
            const params = { ...filters };
            if (isManager) params.phongBan = user.phongBanId;
            const response = await api.get('/attendance/management', { params });
            setAttendance(response.data.attendance);
        } catch (error) {
            console.error('Error fetching attendance:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/attendance/management', formData);
            alert('Chấm công thành công');
            setShowForm(false);
            setFormData({ nhanVienID: '', ngay: new Date().toISOString().split('T')[0], gioVao: '08:00', gioRa: '17:00' });
            fetchAttendance();
        } catch (error) {
            alert(error.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (record) => {
        setEditData({
            id: record.MaChamCong,
            nhanVienID: record.NhanVienID,
            hoTen: record.HoTen,
            ngay: record.Ngay.split('T')[0],
            gioVao: record.GioVao?.substring(0, 5) || '08:00',
            gioRa: record.GioRa?.substring(0, 5) || '17:00'
        });
        setShowEditForm(true);
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.put(`/attendance/management/${editData.id}`, {
                gioVao: editData.gioVao,
                gioRa: editData.gioRa
            });
            alert('Cập nhật chấm công thành công');
            setShowEditForm(false);
            setEditData(null);
            fetchAttendance();
        } catch (error) {
            alert(error.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa bản ghi chấm công này?')) return;
        try {
            await api.delete(`/attendance/management/${id}`);
            alert('Xóa chấm công thành công');
            fetchAttendance();
        } catch (error) {
            alert(error.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const formatDate = (dateString) => new Date(dateString).toLocaleDateString('vi-VN');
    const formatTime = (timeString) => timeString ? timeString.substring(0, 5) : '--';

    const FilterSection = () => (
        <div className="card mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                {user.vaiTro === 'Admin' && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phòng ban</label>
                        <select
                            value={filters.phongBan}
                            onChange={(e) => setFilters({...filters, phongBan: e.target.value})}
                            className="input-field"
                        >
                            <option value="">Tất cả phòng ban</option>
                            {departments.map(dept => (
                                <option key={dept.MaPhongBan} value={dept.MaPhongBan}>{dept.TenPhongBan}</option>
                            ))}
                        </select>
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Loại lọc</label>
                    <select
                        value={filters.filterMode}
                        onChange={(e) => setFilters({...filters, filterMode: e.target.value})}
                        className="input-field"
                    >
                        <option value="month">Theo tháng</option>
                        <option value="range">Theo khoảng thời gian</option>
                    </select>
                </div>

                {filters.filterMode === 'month' ? (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Tháng</label>
                            <select
                                value={filters.month}
                                onChange={(e) => setFilters({...filters, month: e.target.value})}
                                className="input-field"
                            >
                                {Array.from({length: 12}, (_, i) => (
                                    <option key={i+1} value={i+1}>Tháng {i+1}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Năm</label>
                            <input
                                type="number"
                                value={filters.year}
                                onChange={(e) => setFilters({...filters, year: e.target.value})}
                                className="input-field"
                                min="2020"
                                max="2030"
                            />
                        </div>
                    </>
                ) : (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Từ ngày</label>
                            <input
                                type="date"
                                value={filters.startDate}
                                onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                                className="input-field"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Đến ngày</label>
                            <input
                                type="date"
                                value={filters.endDate}
                                onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                                className="input-field"
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    );

    const AttendanceTable = () => (
        <div className="card">
            {loading ? (
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Đang tải...</p>
                </div>
            ) : attendance.length === 0 ? (
                <div className="text-center py-8 text-gray-500">Không có dữ liệu chấm công</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-green-100">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã NV</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Họ tên</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phòng ban</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Giờ vào</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Giờ ra</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tổng giờ</th>
                                {isManager && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hành động</th>}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {attendance.map(record => (
                                <tr key={record.MaChamCong} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{record.MaNhanVien}</td>
                                    <td className="px-6 py-4 text-sm text-gray-900">{record.HoTen}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{record.TenPhongBan}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{formatDate(record.Ngay)}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{formatTime(record.GioVao)}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{formatTime(record.GioRa)}</td>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{record.TongGioLam || 0}h</td>
                                    {isManager && (
                                        <td className="px-6 py-4 text-sm font-medium space-x-2">
                                            <button onClick={() => handleEdit(record)} className="text-blue-600 hover:text-blue-900" title="Sửa">
                                                <Edit size={18} />
                                            </button>
                                            <button onClick={() => handleDelete(record.MaChamCong)} className="text-red-600 hover:text-red-900" title="Xóa">
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );

    const ModalForm = ({ isEdit = false, onClose, onSubmit, data, onChange }) => (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">{isEdit ? 'Sửa chấm công' : 'Chấm công nhân viên'}</h3>
                    <form onSubmit={onSubmit} className="space-y-4">
                        {!isEdit ? (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Nhân viên *</label>
                                    <select
                                        value={data.nhanVienID}
                                        onChange={(e) => onChange({...data, nhanVienID: e.target.value})}
                                        className="input-field"
                                        required
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
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Ngày *</label>
                                    <input
                                        type="date"
                                        value={data.ngay}
                                        onChange={(e) => onChange({...data, ngay: e.target.value})}
                                        className="input-field"
                                        required
                                    />
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <p className="text-sm text-gray-600">Nhân viên</p>
                                    <p className="font-medium text-gray-800">{data.hoTen} (Mã: {data.nhanVienID})</p>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <p className="text-sm text-gray-600">Ngày</p>
                                    <p className="font-medium text-gray-800">{formatDate(data.ngay)}</p>
                                </div>
                            </>
                        )}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Giờ vào *</label>
                                <input
                                    type="time"
                                    value={data.gioVao}
                                    onChange={(e) => onChange({...data, gioVao: e.target.value})}
                                    className="input-field"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Giờ ra</label>
                                <input
                                    type="time"
                                    value={data.gioRa}
                                    onChange={(e) => onChange({...data, gioRa: e.target.value})}
                                    className="input-field"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end space-x-4 pt-4">
                            <button type="button" onClick={onClose} className="btn-secondary" disabled={loading}>Hủy</button>
                            <button type="submit" className="btn-primary" disabled={loading}>
                                {loading ? 'Đang xử lý...' : (isEdit ? 'Cập nhật' : 'Chấm công')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Quản lý Chấm công</h1>
            <p className="text-gray-600 mb-8">
                {isManager ? 'Quản lý chấm công cho nhân viên trong phòng ban của bạn' : 'Xem chấm công toàn hệ thống'}
            </p>

            <FilterSection />
            
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Danh sách chấm công</h2>
                {isManager && (
                    <button onClick={() => setShowForm(true)} className="btn-primary flex items-center">
                        <Plus size={20} className="mr-2" /> Chấm công
                    </button>
                )}
            </div>

            <AttendanceTable />

            {showForm && isManager && (
                <ModalForm
                    onClose={() => setShowForm(false)}
                    onSubmit={handleSubmit}
                    data={formData}
                    onChange={setFormData}
                />
            )}

            {showEditForm && editData && (
                <ModalForm
                    isEdit
                    onClose={() => setShowEditForm(false)}
                    onSubmit={handleEditSubmit}
                    data={editData}
                    onChange={setEditData}
                />
            )}
        </div>
    );
};

export default AttendanceManagement;