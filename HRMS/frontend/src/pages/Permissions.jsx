import { useState, useEffect } from 'react';
import { Shield, Save, X } from 'lucide-react';
import api from '../services/api';

const Permissions = () => {
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState('');
    const [selectedRole, setSelectedRole] = useState('');

    useEffect(() => {
        fetchUsers();
        fetchRoles();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await api.get('/users');
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchRoles = async () => {
        try {
            const response = await api.get('/users/roles');
            setRoles(response.data);
        } catch (error) {
            console.error('Error fetching roles:', error);
        }
    };

    const handleSave = async () => {
        if (!selectedUser || !selectedRole) {
            alert('Vui lòng chọn đầy đủ nhân viên và vai trò');
            return;
        }

        if (!window.confirm('Bạn có chắc chắn muốn thay đổi vai trò người dùng này?')) {
            return;
        }

        try {
            await api.put('/users/role', {
                userId: selectedUser,
                roleId: selectedRole
            });
            alert('Cập nhật thành công! Vai trò mới đã được áp dụng.');
            setSelectedUser('');
            setSelectedRole('');
            fetchUsers();
        } catch (error) {
            alert(error.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const handleCancel = () => {
        setSelectedUser('');
        setSelectedRole('');
    };

    const getRoleColor = (role) => {
        switch (role) {
            case 'Admin':
                return 'bg-red-100 text-red-800';
            case 'Manager':
                return 'bg-blue-100 text-blue-800';
            case 'Employee':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
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
            <div className="mb-8">
                <div className="flex items-center mb-2">
                    <h1 className="text-3xl font-bold text-gray-800">Phân quyền truy cập</h1>
                </div>
                <p className="text-gray-600">Quản lý vai trò và quyền truy cập của người dùng trong hệ thống</p>
            </div>

            {/* Assign Role Form */}
            <div className="card mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
                <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                    <Shield size={24} className="mr-2 text-blue-600" />
                    Gán vai trò người dùng
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Chọn nhân viên <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={selectedUser}
                            onChange={(e) => setSelectedUser(e.target.value)}
                            className="input-field"
                        >
                            <option value="">-- Chọn nhân viên --</option>
                            {users.map(user => (
                                <option key={user.MaNguoiDung} value={user.MaNguoiDung}>
                                    {user.TenNhanVien} - {user.Email}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Chọn vai trò mới <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                            className="input-field"
                        >
                            <option value="">-- Chọn vai trò --</option>
                            {roles.map(role => (
                                <option key={role.MaVaiTro} value={role.MaVaiTro}>
                                    {role.TenVaiTro}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="flex justify-end space-x-4 mt-6">
                    <button
                        onClick={handleCancel}
                        className="btn-secondary inline-flex items-center"
                    >
                        <X size={20} className="mr-2" />
                        Hủy
                    </button>
                    <button
                        onClick={handleSave}
                        className="btn-primary inline-flex items-center"
                    >
                        <Save size={20} className="mr-2" />
                        Lưu
                    </button>
                </div>
            </div>

            {/* Users List */}
            <div className="card">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Danh sách người dùng</h2>
                
                {users.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500 text-lg">Không có người dùng nào trong hệ thống</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Tên nhân viên
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Email
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Phòng ban
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Vai trò hiện tại
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {users.map((user) => (
                                    <tr key={user.MaNguoiDung} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {user.TenNhanVien || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {user.Email}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {user.PhongBan || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleColor(user.VaiTro)}`}>
                                                {user.VaiTro}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Info Box */}
            <div className="mt-6 card bg-yellow-50 border border-yellow-200">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <Shield className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-yellow-800">Lưu ý về phân quyền</h3>
                        <div className="mt-2 text-sm text-yellow-700">
                            <ul className="list-disc pl-5 space-y-1">
                                <li><strong>Admin:</strong> Toàn quyền hệ thống, quản lý tất cả chức năng</li>
                                <li><strong>Manager:</strong> Quản lý nhân viên trong phòng ban, phê duyệt nghỉ phép</li>
                                <li><strong>Employee:</strong> Xem thông tin cá nhân, xin nghỉ phép, xem bảng lương</li>
                                <li><strong>Candidate:</strong> Nộp hồ sơ ứng tuyển, theo dõi hồ sơ ứng tuyển</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Permissions;