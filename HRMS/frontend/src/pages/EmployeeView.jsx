import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, MapPin, Calendar, Briefcase, DollarSign } from 'lucide-react';
import api from '../services/api';

const EmployeeView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [employee, setEmployee] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEmployee();
    }, [id]);

    const fetchEmployee = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/employees/${id}`);
            setEmployee(response.data);
        } catch (error) {
            console.error('Error fetching employee:', error);
            alert(error.response?.data?.message || 'Có lỗi xảy ra');
            navigate('/employees');
        } finally {
            setLoading(false);
        }
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

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
            </div>
        );
    }

    if (!employee) {
        return (
            <div className="p-8">
                <div className="text-center">
                    <p className="text-gray-500 text-lg">Không tìm thấy thông tin nhân viên</p>
                    <Link to="/employees" className="btn-primary mt-4 inline-block">
                        Quay lại danh sách
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8">
            <div className="mb-6">
                <button
                    onClick={() => navigate('/employees')}
                    className="inline-flex items-center text-blue-600 hover:text-blue-800"
                >
                    <ArrowLeft size={20} className="mr-2" />
                    Quay lại danh sách
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Personal Info */}
                <div className="lg:col-span-1">
                    <div className="card">
                        <div className="text-center mb-6">
                            {employee.AnhDaiDien ? (
                                <img
                                    src={`http://localhost:5000${employee.AnhDaiDien}`}
                                    alt={employee.HoTen}
                                    className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-blue-100"
                                />
                            ) : (
                                <div className="w-32 h-32 rounded-full mx-auto bg-blue-100 flex items-center justify-center text-blue-600 text-4xl font-bold border-4 border-blue-200">
                                    {employee.HoTen.charAt(0)}
                                </div>
                            )}
                            <h2 className="text-2xl font-bold text-gray-800 mt-4">{employee.HoTen}</h2>
                            <p className="text-gray-600">{employee.TenChucVu}</p>
                            <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                                Mã NV: {employee.MaNhanVien}
                            </span>
                        </div>

                        <div className="border-t pt-6 space-y-4">
                            <h3 className="font-semibold text-gray-800 mb-4">Thông tin liên hệ</h3>
                            
                            <div className="flex items-start space-x-3">
                                <Mail size={20} className="text-gray-400 mt-1" />
                                <div>
                                    <p className="text-sm text-gray-600">Email</p>
                                    <p className="font-medium text-gray-800">{employee.Email}</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3">
                                <Phone size={20} className="text-gray-400 mt-1" />
                                <div>
                                    <p className="text-sm text-gray-600">Số điện thoại</p>
                                    <p className="font-medium text-gray-800">{employee.SoDienThoai}</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3">
                                <MapPin size={20} className="text-gray-400 mt-1" />
                                <div>
                                    <p className="text-sm text-gray-600">Địa chỉ</p>
                                    <p className="font-medium text-gray-800">{employee.DiaChi || 'N/A'}</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3">
                                <Calendar size={20} className="text-gray-400 mt-1" />
                                <div>
                                    <p className="text-sm text-gray-600">Ngày sinh</p>
                                    <p className="font-medium text-gray-800">{formatDate(employee.NgaySinh)}</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3">
                                <div className="w-5 h-5 mt-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-gray-400">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Giới tính</p>
                                    <p className="font-medium text-gray-800">{employee.GioiTinh}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Work Info */}
                <div className="lg:col-span-2">
                    <div className="card mb-6">
                        <h3 className="text-xl font-semibold text-gray-800 mb-6 pb-3 border-b">
                            Thông tin công việc
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <div className="flex items-start space-x-3 mb-4">
                                    <Briefcase size={20} className="text-gray-400 mt-1" />
                                    <div>
                                        <p className="text-sm text-gray-600">Phòng ban</p>
                                        <p className="font-medium text-gray-800 text-lg">{employee.TenPhongBan}</p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-3 mb-4">
                                    <Briefcase size={20} className="text-gray-400 mt-1" />
                                    <div>
                                        <p className="text-sm text-gray-600">Chức vụ</p>
                                        <p className="font-medium text-gray-800 text-lg">{employee.TenChucVu}</p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-3">
                                    <DollarSign size={20} className="text-gray-400 mt-1" />
                                    <div>
                                        <p className="text-sm text-gray-600">Lương cơ bản</p>
                                        <p className="font-medium text-gray-800 text-lg">{formatCurrency(employee.LuongCoBan)}</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <div className="mb-4">
                                    <p className="text-sm text-gray-600 mb-1">Loại hợp đồng</p>
                                    <p className="font-medium text-gray-800">{getContractType(employee.LoaiHopDong)}</p>
                                </div>

                                <div className="mb-4">
                                    <p className="text-sm text-gray-600 mb-1">Ngày bắt đầu hợp đồng</p>
                                    <p className="font-medium text-gray-800">{formatDate(employee.NgayBatDauHopDong)}</p>
                                </div>

                                {employee.NgayKetThucHopDong && (
                                    <div className="mb-4">
                                        <p className="text-sm text-gray-600 mb-1">Ngày kết thúc hợp đồng</p>
                                        <p className="font-medium text-gray-800">{formatDate(employee.NgayKetThucHopDong)}</p>
                                    </div>
                                )}

                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Trạng thái</p>
                                    <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${
                                        employee.TrangThai === 'ConLam' ? 'bg-green-100 text-green-800' :
                                        employee.TrangThai === 'NghiPhep' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-red-100 text-red-800'
                                    }`}>
                                        {employee.TrangThai === 'ConLam' ? 'Còn làm' :
                                         employee.TrangThai === 'NghiPhep' ? 'Nghỉ phép' : 'Nghỉ việc'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    
                </div>
            </div>
        </div>
    );
};

export default EmployeeView;