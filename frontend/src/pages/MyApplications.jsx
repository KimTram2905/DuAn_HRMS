// pages/MyApplications.jsx - NOTE: U4.2 - Ứng viên xem hồ sơ của mình
import { useState, useEffect } from 'react';
import { FileText, Calendar, Briefcase } from 'lucide-react';
import api from '../services/api';

const MyApplications = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        try {
            setLoading(true);
            const response = await api.get('/recruitment/my-applications');
            setApplications(response.data);
        } catch (error) {
            console.error('Error fetching applications:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Moi': return 'bg-blue-100 text-blue-700';
            case 'PhongVan': return 'bg-yellow-100 text-yellow-700';
            case 'DaTuyen': return 'bg-green-100 text-green-700';
            case 'TuChoi': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
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

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="p-8 ">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-1 flex items-center">
                    Hồ sơ của tôi
                </h1>
                <p className="text-gray-600">
                    Theo dõi trạng thái các hồ sơ ứng tuyển của bạn
                </p>
            </div>

            {applications.length === 0 ? (
                <div className="card text-center py-12">
                    <FileText size={48} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500 text-lg mb-4">
                        Bạn chưa nộp hồ sơ nào
                    </p>
                    <a href="/recruitment/jobs" className="btn-primary inline-block">
                        Xem tin tuyển dụng
                    </a>
                </div>
            ) : (
                <div className="space-y-6">
                    {applications.map((app) => (
                        <div
                            key={app.MaHoSo}
                            className="card hover:shadow-xl transition-shadow"
                        >
                            {/* Header card */}
                            <div className="flex flex-wrap justify-between items-center mb-4 gap-3">
                                <h3 className="text-xl font-bold text-gray-800 flex items-center">
                                    {app.ViTri}
                                </h3>

                                <span
                                    className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(app.TrangThai)}`}
                                >
                                    {getStatusText(app.TrangThai)}
                                </span>
                            </div>

                            {/* Meta info */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <div>
                                    <p className="text-xs text-gray-500 uppercase">Mã hồ sơ</p>
                                    <p className="font-medium text-gray-800">{app.MaHoSo}</p>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-500 uppercase">Ngày nộp</p>
                                    <p className="font-medium text-gray-800 flex items-center">
                                        <Calendar size={16} className="mr-1 text-gray-500" />
                                        {formatDate(app.NgayNop)}
                                    </p>
                                </div>

                                {app.MucLuong && (
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase">Mức lương</p>
                                        <p className="font-medium text-gray-800">{app.MucLuong}</p>
                                    </div>
                                )}
                            </div>

                            {/* Experience */}
                            {app.KinhNghiem && (
                                <div className="mb-4">
                                    <p className="text-sm text-gray-600 mb-1">Yêu cầu kinh nghiệm</p>
                                    <p className="text-gray-800">{app.KinhNghiem}</p>
                                </div>
                            )}

                            {/* Contact info */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-sm font-medium text-gray-700 mb-2">
                                    Thông tin liên hệ
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-700">
                                    <p><strong>Họ tên:</strong> {app.HoTen}</p>
                                    <p><strong>Email:</strong> {app.Email}</p>
                                    <p><strong>SĐT:</strong> {app.SoDienThoai}</p>
                                </div>
                            </div>

                            {/* Status messages */}
                            {app.TrangThai === 'TuChoi' && (
                                <div className="mt-4 bg-red-50 border border-red-200 p-3 rounded-lg text-sm text-red-700">
                                    <strong>Lưu ý:</strong> Hồ sơ của bạn chưa phù hợp với vị trí này lần này. 
                                    Đừng nản lòng, hãy thử ứng tuyển các vị trí khác!
                                </div>
                            )}

                            {app.TrangThai === 'PhongVan' && (
                                <div className="mt-4 bg-yellow-50 border border-yellow-200 p-3 rounded-lg text-sm text-yellow-700">
                                    <strong>Chúc mừng!</strong> Hồ sơ của bạn đã được chọn. 
                                    Chúng tôi sẽ liên hệ sớm để sắp xếp lịch phỏng vấn.
                                </div>
                            )}

                            {app.TrangThai === 'DaTuyen' && (
                                <div className="mt-4 bg-green-50 border border-green-200 p-3 rounded-lg text-sm text-green-700">
                                    <strong>Xin chúc mừng!</strong> Bạn đã được tuyển dụng. 
                                    Vui lòng kiểm tra email để biết thêm chi tiết.
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyApplications;
