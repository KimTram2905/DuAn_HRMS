// pages/JobDetail.jsx - NOTE: Xem chi tiết tin tuyển dụng (tất cả vai trò)
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Briefcase, DollarSign, TrendingUp, Calendar, Award, BookOpen, FileText } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const JobDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);

    const isCandidate = user?.vaiTro === 'Candidate';

    useEffect(() => {
        fetchJob();
    }, [id]);

    const fetchJob = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/recruitment/jobs/${id}`);
            setJob(response.data);
        } catch (error) {
            console.error('Error fetching job:', error);
            alert('Không thể tải thông tin tin tuyển dụng');
            navigate('/recruitment/jobs');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    const isExpired = () => {
        return new Date(job.HanNop) < new Date();
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
            </div>
        );
    }

    if (!job) {
        return (
            <div className="p-8">
                <div className="card text-center py-12">
                    <p className="text-gray-500 text-lg">Không tìm thấy tin tuyển dụng</p>
                    <button onClick={() => navigate('/recruitment/jobs')} className="btn-primary mt-4">
                        Quay lại danh sách
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8">
            {/* Back Button */}
            <div className="mb-6">
                <button
                    onClick={() => navigate('/recruitment/jobs')}
                    className="inline-flex items-center text-blue-600 hover:text-blue-800"
                >
                    <ArrowLeft size={20} className="mr-2" />
                    Quay lại danh sách
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Quick Info */}
                <div className="lg:col-span-1">
                    <div className="card sticky top-8">
                        <div className="text-center mb-6">
                            <div className="w-20 h-20 rounded-full mx-auto bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white mb-4">
                                <Briefcase size={32} />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800">{job.ViTri}</h2>
                            {isExpired() && (
                                <span className="inline-block mt-2 px-3 py-1 bg-red-100 text-red-600 text-sm font-medium rounded-full">
                                    Đã hết hạn
                                </span>
                            )}
                        </div>

                        <div className="border-t pt-6 space-y-4">
                            {job.MucLuong && (
                                <div className="flex items-start space-x-3">
                                    <DollarSign size={20} className="text-green-600 mt-1" />
                                    <div>
                                        <p className="text-sm text-gray-600">Mức lương</p>
                                        <p className="font-medium text-gray-800">{job.MucLuong}</p>
                                    </div>
                                </div>
                            )}

                            {job.KinhNghiem && (
                                <div className="flex items-start space-x-3">
                                    <TrendingUp size={20} className="text-blue-600 mt-1" />
                                    <div>
                                        <p className="text-sm text-gray-600">Kinh nghiệm</p>
                                        <p className="font-medium text-gray-800">{job.KinhNghiem}</p>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-start space-x-3">
                                <Calendar size={20} className="text-orange-600 mt-1" />
                                <div>
                                    <p className="text-sm text-gray-600">Hạn nộp</p>
                                    <p className="font-medium text-gray-800">{formatDate(job.HanNop)}</p>
                                </div>
                            </div>
                        </div>

                        {isCandidate && !isExpired() && (
                            <div className="mt-6 pt-6 border-t">
                                <button
                                    onClick={() => navigate(`/recruitment/jobs/${id}/apply`)}
                                    className="w-full btn-primary py-3 text-lg"
                                >
                                    Ứng tuyển ngay
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column - Detailed Info */}
                <div className="lg:col-span-2">
                    <div className="card">
                        <h1 className="text-3xl font-bold text-gray-800 mb-6">
                            Thông tin chi tiết
                        </h1>

                        {/* Mô tả công việc */}
                        {job.MoTaCongViec && (
                            <div className="mb-8">
                                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                                    <FileText size={24} className="mr-2 text-blue-600" />
                                    Mô tả công việc
                                </h3>
                                <div className="bg-gray-50 p-6 rounded-lg">
                                    <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                                        {job.MoTaCongViec}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Yêu cầu kỹ năng */}
                        {job.YeuCauKyNang && (
                            <div className="mb-8">
                                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                                    <Award size={24} className="mr-2 text-blue-600" />
                                    Yêu cầu kỹ năng
                                </h3>
                                <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                                    <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                                        {job.YeuCauKyNang}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Yêu cầu bằng cấp */}
                        {job.YeuCauBangCap && (
                            <div className="mb-8">
                                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                                    <BookOpen size={24} className="mr-2 text-blue-600" />
                                    Yêu cầu bằng cấp
                                </h3>
                                <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                                    <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                                        {job.YeuCauBangCap}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Note for Candidate */}
                        {isCandidate && !isExpired() && (
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-6 rounded-lg">
                                <h3 className="text-lg font-semibold text-blue-900 mb-3">Quan tâm đến vị trí này?</h3>
                                <p className="text-blue-800 mb-4">
                                    Nộp hồ sơ ngay để chúng tôi có thể xem xét ứng viên phù hợp nhất. 
                                    Chuẩn bị CV và thông tin liên hệ của bạn để bắt đầu quá trình ứng tuyển.
                                </p>
                                <button
                                    onClick={() => navigate(`/recruitment/jobs/${id}/apply`)}
                                    className="btn-primary"
                                >
                                    Ứng tuyển ngay
                                </button>
                            </div>
                        )}

                        {/* Expired notice */}
                        {isExpired() && (
                            <div className="bg-red-50 border border-red-200 p-6 rounded-lg">
                                <p className="text-red-700">
                                    <strong>Thông báo:</strong> Tin tuyển dụng này đã hết hạn nộp hồ sơ. 
                                    Vui lòng xem các tin tuyển dụng khác.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JobDetail;