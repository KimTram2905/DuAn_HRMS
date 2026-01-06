// pages/RecruitmentManagement.jsx - NOTE: U4.3 - Quản lý hồ sơ ứng viên
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Search, Eye, Filter, Download } from 'lucide-react';
import api from '../services/api';

const RecruitmentManagement = () => {
    const navigate = useNavigate();
    const [applications, setApplications] = useState([]);
    const [filters, setFilters] = useState({
        status: '',
        search: ''
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        try {
            setLoading(true);
            const response = await api.get('/recruitment/applications', { params: filters });
            setApplications(response.data);
        } catch (error) {
            console.error('Error fetching applications:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        fetchApplications();
    };

    const handleResetFilters = () => {
        setFilters({ status: '', search: '' });
        setTimeout(() => {
            fetchApplications();
        }, 100);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Moi': return 'bg-blue-100 text-blue-800';
            case 'PhongVan': return 'bg-yellow-100 text-yellow-800';
            case 'DaTuyen': return 'bg-green-100 text-green-800';
            case 'TuChoi': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'Moi': return 'Mới nộp';
            case 'PhongVan': return 'Chờ phỏng vấn';
            case 'DaTuyen': return 'Đã tuyển';
            case 'TuChoi': return 'Từ chối';
            default: return status;
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    const handleDownloadCV = (cvPath) => {
        window.open(`http://localhost:5000${cvPath}`, '_blank');
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
                <h1 className="text-3xl font-bold text-gray-800 mb-1 flex items-center">
                    Quản lý hồ sơ ứng viên
                </h1>
                <p className="text-gray-600">Xem và quản lý các hồ sơ ứng tuyển</p>
            </div>

            {/* Filters */}
            {/* Filters */}
<div className="card mb-6">
    <div className="flex items-center mb-4">
        <Filter size={20} className="mr-2 text-gray-600" />
        <h2 className="text-lg font-semibold text-gray-800">Bộ lọc</h2>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
        {/* Tìm kiếm */}
        <div className="md:col-span-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">
                Tìm kiếm
            </label>
            <div className="relative">
                <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={20}
                />
                <input
                    type="text"
                    placeholder="Tên ứng viên, email, vị trí..."
                    value={filters.search}
                    onChange={(e) =>
                        setFilters({ ...filters, search: e.target.value })
                    }
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="input-field pl-10"
                />
            </div>
        </div>

        {/* Trạng thái */}
        <div className="md:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">
                Trạng thái
            </label>
            <select
                value={filters.status}
                onChange={(e) =>
                    setFilters({ ...filters, status: e.target.value })
                }
                className="input-field"
            >
                <option value="">Tất cả</option>
                <option value="Moi">Mới nộp</option>
                <option value="PhongVan">Chờ phỏng vấn</option>
                <option value="DaTuyen">Đã tuyển</option>
                <option value="TuChoi">Từ chối</option>
            </select>
        </div>

        {/* Nút tìm kiếm */}
        <div className="md:col-span-2">
            <button
                onClick={handleSearch}
                className="btn-primary w-full"
            >
                <Search size={18} className="inline mr-2" />
                Tìm kiếm
            </button>
        </div>

        {/* Nút đặt lại */}
        <div className="md:col-span-2">
            <button
                onClick={handleResetFilters}
                className="btn-secondary w-full"
            >
                Đặt lại
            </button>
        </div>
    </div>
</div>

            {/* Statistics */}
            {applications.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                    <div className="card bg-blue-50 border border-blue-200">
                        <p className="text-sm text-blue-600 mb-1">Mới nộp</p>
                        <p className="text-2xl font-bold text-blue-800">
                            {applications.filter(a => a.TrangThai === 'Moi').length}
                        </p>
                    </div>
                    <div className="card bg-yellow-50 border border-yellow-200">
                        <p className="text-sm text-yellow-600 mb-1">Chờ phỏng vấn</p>
                        <p className="text-2xl font-bold text-yellow-800">
                            {applications.filter(a => a.TrangThai === 'PhongVan').length}
                        </p>
                    </div>
                    <div className="card bg-green-50 border border-green-200">
                        <p className="text-sm text-green-600 mb-1">Đã tuyển</p>
                        <p className="text-2xl font-bold text-green-800">
                            {applications.filter(a => a.TrangThai === 'DaTuyen').length}
                        </p>
                    </div>
                    <div className="card bg-red-50 border border-red-200">
                        <p className="text-sm text-red-600 mb-1">Từ chối</p>
                        <p className="text-2xl font-bold text-red-800">
                            {applications.filter(a => a.TrangThai === 'TuChoi').length}
                        </p>
                    </div>
                </div>
            )}

            {/* Applications Table */}
            <div className="card">
                <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-3 border-b">
                    Danh sách hồ sơ ({applications.length})
                </h2>

                {applications.length === 0 ? (
                    <div className="text-center py-12">
                        <FileText size={48} className="mx-auto text-gray-300 mb-3" />
                        <p className="text-gray-500 text-lg">Không có hồ sơ nào phù hợp</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-blue-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã hồ sơ</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Họ tên</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SĐT</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vị trí</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày nộp</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hành động</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {applications.map((app) => (
                                    <tr key={app.MaHoSo} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                            {app.MaHoSo}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {app.HoTen}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {app.Email}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {app.SoDienThoai}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {app.ViTri}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {formatDate(app.NgayNop)}
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(app.TrangThai)}`}>
                                                {getStatusText(app.TrangThai)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium space-x-2">
                                            <button
                                                onClick={() => navigate(`/recruitment/applications/${app.MaHoSo}`)}
                                                className="text-blue-600 hover:text-blue-900"
                                                title="Xem chi tiết"
                                            >
                                                <Eye size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDownloadCV(app.DuongDanCV)}
                                                className="text-green-600 hover:text-green-900"
                                                title="Tải CV"
                                            >
                                                <Download size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RecruitmentManagement;