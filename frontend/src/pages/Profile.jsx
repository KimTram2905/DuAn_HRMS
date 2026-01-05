import { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Calendar, Briefcase, DollarSign, Edit, Clock } from 'lucide-react';
import api from '../services/api';
import EditRequestModal from '../components/common/EditRequestModal';

const Profile = () => {
    const [profile, setProfile] = useState(null);
    const [editRequests, setEditRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showEditModal, setShowEditModal] = useState(false);

    useEffect(() => {
        fetchProfile();
        fetchEditRequests();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const response = await api.get('/profile/me');
            setProfile(response.data);
        } catch (error) {
            console.error('Error fetching profile:', error);
            alert('Không thể tải thông tin cá nhân');
        } finally {
            setLoading(false);
        }
    };

    const fetchEditRequests = async () => {
        try {
            const response = await api.get('/profile/edit-requests');
            setEditRequests(response.data);
        } catch (error) {
            console.error('Error fetching edit requests:', error);
        }
    };

    const handleEditRequestSuccess = () => {
        setShowEditModal(false);
        fetchEditRequests();
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(value);
    };

    const getContractType = (type) => {
        const types = {
            'ThuViec': 'Thử việc',
            'ChinhThuc': 'Chính thức',
            'CTV': 'Cộng tác viên',
            'Khac': 'Khác'
        };
        return types[type] || type;
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'DangCho':
                return 'bg-yellow-100 text-yellow-800';
            case 'DaDuyet':
                return 'bg-green-100 text-green-800';
            case 'TuChoi':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'DangCho':
                return 'Đang chờ';
            case 'DaDuyet':
                return 'Đã duyệt';
            case 'TuChoi':
                return 'Từ chối';
            default:
                return status;
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="p-8">
                <div className="text-center">
                    <p className="text-gray-500 text-lg">Không tìm thấy thông tin cá nhân</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Thông tin cá nhân</h1>
                <p className="text-gray-600">Xem và quản lý thông tin cá nhân của bạn</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Personal Info */}
                <div className="lg:col-span-1">
                    <div className="card sticky top-8">
                        <div className="text-center mb-6">
                            {profile.AnhDaiDien ? (
                                <img
                                    src={`http://localhost:5000${profile.AnhDaiDien}`}
                                    alt={profile.HoTen}
                                    className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-blue-100"
                                />
                            ) : (
                                <div className="w-32 h-32 rounded-full mx-auto bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-4xl font-bold border-4 border-blue-200">
                                    {profile.HoTen.charAt(0)}
                                </div>
                            )}
                            <h2 className="text-2xl font-bold text-gray-800 mt-4">{profile.HoTen}</h2>
                            <p className="text-gray-600">{profile.TenChucVu}</p>
                            <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                                Mã NV: {profile.MaNhanVien}
                            </span>
                        </div>

                        <div className="border-t pt-6 space-y-4">
                            <h3 className="font-semibold text-gray-800 mb-4">Thông tin liên hệ</h3>
                            
                            <div className="flex items-start space-x-3">
                                <Mail size={20} className="text-blue-600 mt-1" />
                                <div className="flex-1">
                                    <p className="text-sm text-gray-600">Email</p>
                                    <p className="font-medium text-gray-800 break-all">{profile.Email}</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3">
                                <Phone size={20} className="text-blue-600 mt-1" />
                                <div className="flex-1">
                                    <p className="text-sm text-gray-600">Số điện thoại</p>
                                    <p className="font-medium text-gray-800">{profile.SoDienThoai}</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3">
                                <MapPin size={20} className="text-blue-600 mt-1" />
                                <div className="flex-1">
                                    <p className="text-sm text-gray-600">Địa chỉ</p>
                                    <p className="font-medium text-gray-800">{profile.DiaChi || 'N/A'}</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3">
                                <Calendar size={20} className="text-blue-600 mt-1" />
                                <div className="flex-1">
                                    <p className="text-sm text-gray-600">Ngày sinh</p>
                                    <p className="font-medium text-gray-800">{formatDate(profile.NgaySinh)}</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3">
                                <div className="w-5 h-5 mt-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-blue-600">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-gray-600">Giới tính</p>
                                    <p className="font-medium text-gray-800">{profile.GioiTinh}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-t">
                            <button
                                onClick={() => setShowEditModal(true)}
                                className="w-full btn-primary flex items-center justify-center"
                            >
                                <Edit size={20} className="mr-2" />
                                Yêu cầu chỉnh sửa
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Column - Work Info & Edit Requests */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Work Information */}
                    <div className="card">
                        <h3 className="text-xl font-semibold text-gray-800 mb-6 pb-3 border-b flex items-center">
                            <Briefcase size={24} className="mr-2 text-blue-600" />
                            Thông tin công việc
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <p className="text-sm text-blue-600 mb-1">Phòng ban</p>
                                    <p className="font-semibold text-gray-800 text-lg">{profile.TenPhongBan}</p>
                                </div>

                                <div className="bg-green-50 p-4 rounded-lg">
                                    <p className="text-sm text-green-600 mb-1">Chức vụ</p>
                                    <p className="font-semibold text-gray-800 text-lg">{profile.TenChucVu}</p>
                                </div>

                                <div className="bg-purple-50 p-4 rounded-lg">
                                    <div className="flex items-center mb-1">
                                        <DollarSign size={16} className="text-purple-600 mr-1" />
                                        <p className="text-sm text-purple-600">Lương cơ bản</p>
                                    </div>
                                    <p className="font-semibold text-gray-800 text-lg">{formatCurrency(profile.LuongCoBan)}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm text-gray-600 mb-2">Loại hợp đồng</p>
                                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-medium">
                                        {getContractType(profile.LoaiHopDong)}
                                    </span>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Ngày bắt đầu hợp đồng</p>
                                    <p className="font-medium text-gray-800">{formatDate(profile.NgayBatDauHopDong)}</p>
                                </div>

                                {profile.NgayKetThucHopDong && (
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Ngày kết thúc hợp đồng</p>
                                        <p className="font-medium text-gray-800">{formatDate(profile.NgayKetThucHopDong)}</p>
                                    </div>
                                )}

                                <div>
                                    <p className="text-sm text-gray-600 mb-2">Trạng thái</p>
                                    <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${
                                        profile.TrangThai === 'ConLam' ? 'bg-green-100 text-green-800' :
                                        profile.TrangThai === 'NghiPhep' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-red-100 text-red-800'
                                    }`}>
                                        {profile.TrangThai === 'ConLam' ? 'Còn làm' :
                                         profile.TrangThai === 'NghiPhep' ? 'Nghỉ phép' : 'Nghỉ việc'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Edit Requests History */}
                    <div className="card">
                        <h3 className="text-xl font-semibold text-gray-800 mb-6 pb-3 border-b flex items-center">
                            <Clock size={24} className="mr-2 text-blue-600" />
                            Lịch sử yêu cầu chỉnh sửa
                        </h3>

                        {editRequests.length === 0 ? (
                            <div className="text-center py-8">
                                <Clock size={48} className="mx-auto text-gray-300 mb-3" />
                                <p className="text-gray-500">Chưa có yêu cầu chỉnh sửa nào</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {editRequests.map((request) => (
                                    <div key={request.MaYeuCau} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <p className="font-semibold text-gray-800">{request.TenTruong}</p>
                                                <p className="text-sm text-gray-500">
                                                    {formatDate(request.NgayTao)}
                                                </p>
                                            </div>
                                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(request.TrangThai)}`}>
                                                {getStatusText(request.TrangThai)}
                                            </span>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                                            <div>
                                                <p className="text-gray-600">Giá trị hiện tại:</p>
                                                <p className="font-medium text-gray-800">{request.GiaTriHienTai || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-600">Giá trị mới:</p>
                                                <p className="font-medium text-blue-600">{request.GiaTriMoi}</p>
                                            </div>
                                        </div>

                                        <div className="text-sm">
                                            <p className="text-gray-600 mb-1">Lý do:</p>
                                            <p className="text-gray-800 bg-gray-50 p-2 rounded">{request.LyDo}</p>
                                        </div>

                                        {request.GhiChuDuyet && (
                                            <div className="mt-3 text-sm">
                                                <p className="text-gray-600 mb-1">Ghi chú từ quản lý:</p>
                                                <p className="text-gray-800 bg-yellow-50 p-2 rounded border border-yellow-200">
                                                    {request.GhiChuDuyet}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Note Section */}
                    <div className="card bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
                        <div className="flex items-start">
                            <div className="flex-shrink-0">
                                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="ml-4">
                                <h3 className="text-lg font-semibold text-blue-900 mb-2">Lưu ý</h3>
                                <ul className="text-blue-800 space-y-1 text-sm">
                                    <li>• Bạn chỉ có thể xem thông tin cá nhân của chính mình</li>
                                    <li>• Không thể chỉnh sửa trực tiếp thông tin</li>
                                    <li>• Sử dụng nút "Yêu cầu chỉnh sửa" để gửi yêu cầu cập nhật đến Quản trị viên</li>
                                    <li>• Quản trị viên sẽ xem xét và phê duyệt yêu cầu của bạn</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Request Modal */}
            {showEditModal && (
                <EditRequestModal
                    profile={profile}
                    onClose={() => setShowEditModal(false)}
                    onSuccess={handleEditRequestSuccess}
                />
            )}
        </div>
    );
};

export default Profile;