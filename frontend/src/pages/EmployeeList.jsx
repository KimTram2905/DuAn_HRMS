import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, UserPlus, Eye, Edit, Trash2 } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const EmployeeList = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [phongBan, setPhongBan] = useState('');
    const [departments, setDepartments] = useState([]);
    const [deleteModal, setDeleteModal] = useState({ show: false, employee: null });
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetchDepartments();
        fetchEmployees();
    }, []);

    const fetchDepartments = async () => {
        try {
            const response = await api.get('/employees/data/departments');
            setDepartments(response.data);
        } catch (error) {
            console.error('Error fetching departments:', error);
        }
    };

    const fetchEmployees = async () => {
        try {
            setLoading(true);
            const params = {};
            if (search) params.search = search;
            if (phongBan) params.phongBan = phongBan;

            const response = await api.get('/employees', { params });
            setEmployees(response.data);
        } catch (error) {
            console.error('Error fetching employees:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        try {
            await api.delete(`/employees/${deleteModal.employee.MaNhanVien}`);
            setDeleteModal({ show: false, employee: null });
            fetchEmployees();
            alert('Xóa nhân viên thành công');
        } catch (error) {
            alert(error.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'ConLam': return 'text-green-600 bg-green-100';
            case 'NghiPhep': return 'text-yellow-600 bg-yellow-100';
            case 'NghiViec': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'ConLam': return 'Còn làm';
            case 'NghiPhep': return 'Nghỉ phép';
            case 'NghiViec': return 'Nghỉ việc';
            default: return status;
        }
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
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-1">Danh sách Nhân viên</h1>
                    <p className="text-gray-600">Quản lý thông tin nhân viên trong hệ thống</p>
                </div>

                {user.vaiTro === 'Admin' && (
                    <Link
                        to="/employees/add"
                        className="btn-primary inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md"
                    >
                        <UserPlus size={20} className="mr-2" />
                        Thêm nhân viên
                    </Link>
                )}
            </div>

            {/* Search + Filter */}
            <div className="card mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    <div className="md:col-span-2 flex">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Tìm theo tên / Mã NV..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="input-field pl-10"
                            />
                        </div>
                        <button
                            onClick={fetchEmployees}
                            className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                        >
                            <Search size={18} className="mr-1" />
                            Tìm
                        </button>
                    </div>
                    <div>
                        <select
                            value={phongBan}
                            onChange={(e) => setPhongBan(e.target.value)}
                            className="input-field"
                        >
                            <option value="">--Tất cả phòng ban--</option>
                            {departments.map(dept => (
                                <option key={dept.MaPhongBan} value={dept.MaPhongBan}>
                                    {dept.TenPhongBan}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Employees Table */}
            <div className="card">
                {employees.length === 0 ? (
                    <div className="text-center py-12 ">
                        <p className="text-gray-500 text-lg">Không tìm thấy nhân viên phù hợp</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-green-100">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã NV</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Họ tên</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phòng ban</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Chức vụ</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hành động</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {employees.map((emp) => (
                                    <tr key={emp.MaNhanVien} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{emp.MaNhanVien}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{emp.HoTen}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{emp.Email}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{emp.TenPhongBan}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{emp.TenChucVu}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(emp.TrangThai)}`}>
                                                {getStatusText(emp.TrangThai)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium space-x-2">
                                            <button
                                                onClick={() => navigate(`/employees/${emp.MaNhanVien}`)}
                                                className="text-blue-600 hover:text-blue-900"
                                                title="Xem"
                                            >
                                                <Eye size={18} />
                                            </button>
                                            {(user.vaiTro === 'Admin' || user.vaiTro === 'Manager') && (
                                                <button
                                                    onClick={() => navigate(`/employees/edit/${emp.MaNhanVien}`)}
                                                    className="text-green-600 hover:text-green-900"
                                                    title="Sửa"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                            )}
                                            {user.vaiTro === 'Admin' && (
                                                <button
                                                    onClick={() => setDeleteModal({ show: true, employee: emp })}
                                                    className="text-red-600 hover:text-red-900"
                                                    title="Xóa"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Delete Modal */}
            {deleteModal.show && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-lg">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Xác nhận xóa nhân viên
                        </h3>
                        <p className="text-gray-600 mb-2">
                            Bạn có chắc chắn muốn xóa nhân viên này không?
                        </p>
                        <div className="bg-gray-50 p-4 rounded mb-4">
                            <p><strong>Họ tên:</strong> {deleteModal.employee?.HoTen}</p>
                            <p><strong>Mã NV:</strong> #{deleteModal.employee?.MaNhanVien}</p>
                            <p><strong>Phòng ban:</strong> {deleteModal.employee?.TenPhongBan}</p>
                        </div>
                        <p className="text-sm text-yellow-600 mb-4">
                            Hành động này sẽ chuyển trạng thái sang <b>'Nghỉ việc'</b>.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteModal({ show: false, employee: null })}
                                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleDelete}
                                className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700"
                            >
                                Xác nhận xóa
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmployeeList;
