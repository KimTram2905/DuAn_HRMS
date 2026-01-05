// pages/JobList.jsx - NOTE: U4.1 & U4.2
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Plus, Search, Calendar, DollarSign, TrendingUp, Eye, Edit, Trash2 } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const JobList = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [jobs, setJobs] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [deleteModal, setDeleteModal] = useState({ show: false, job: null });

    const isManager = ['Manager', 'Admin'].includes(user?.vaiTro);
    const isCandidate = user?.vaiTro === 'Candidate';

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            setLoading(true);
            const response = await api.get('/recruitment/jobs', { params: { search } });
            setJobs(response.data);
        } catch (error) {
            console.error('Error fetching jobs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        fetchJobs();
    };

    const handleDelete = async () => {
        try {
            await api.delete(`/recruitment/jobs/${deleteModal.job.MaTin}`);
            alert('Xóa tin tuyển dụng thành công');
            setDeleteModal({ show: false, job: null });
            fetchJobs();
        } catch (error) {
            alert(error.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    const isExpired = (deadline) => {
        return new Date(deadline) < new Date();
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
                <h1 className="text-3xl font-bold text-gray-800 mb-1">
                    Tuyển dụng
                </h1>
                <p className="text-gray-600">
                    {isManager
                        ? 'Quản lý tin tuyển dụng và hồ sơ ứng viên'
                        : isCandidate
                        ? 'Tìm kiếm và ứng tuyển công việc phù hợp'
                        : 'Danh sách các vị trí tuyển dụng'}
                </p>
            </div>

            {/* Search + Create */}
            <div className="card mb-6">
                <div className="flex gap-4 items-center">
                    {/* Search input */}
                    <div className="relative flex-1">
                        <Search
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                            size={20}
                        />
                        <input
                            type="text"
                            placeholder="Tìm theo vị trí, mô tả công việc..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            className="input-field pl-10"
                        />
                    </div>

                    {/* Search button */}
                    <button
                        onClick={handleSearch}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Tìm kiếm
                    </button>

                    {/* Create job button */}
                    {isManager && (
                        <button
                            onClick={() => navigate('/recruitment/jobs/create')}
                            className="inline-flex items-center px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-md whitespace-nowrap"
                        >
                            <Plus size={20} className="mr-2" />
                            Đăng tin tuyển dụng
                        </button>
                    )}
                </div>
            </div>

            {/* Job Cards */}
            {jobs.length === 0 ? (
                <div className="card text-center py-12">
                    <Briefcase size={48} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500 text-lg">Không có tin tuyển dụng nào</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {jobs.map((job) => {
                        const expired = isExpired(job.HanNop);
                        return (
                            <div
                                key={job.MaTin}
                                className={`card hover:shadow-xl transition-shadow ${expired ? 'opacity-70' : ''}`}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold text-gray-800 mb-2">
                                            {job.ViTri}
                                        </h3>
                                        {expired && (
                                            <span className="inline-block px-2 py-1 bg-red-100 text-red-600 text-xs font-medium rounded-full">
                                                Đã hết hạn
                                            </span>
                                        )}
                                    </div>

                                    {isManager && (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => navigate(`/recruitment/jobs/edit/${job.MaTin}`)}
                                                className="text-blue-600 hover:text-blue-900"
                                                title="Sửa"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                onClick={() => setDeleteModal({ show: true, job })}
                                                className="text-red-600 hover:text-red-900"
                                                title="Xóa"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2 mb-4">
                                    {job.MucLuong && (
                                        <div className="flex items-center text-gray-600">
                                            <DollarSign size={16} className="mr-2 text-green-600" />
                                            <span>{job.MucLuong}</span>
                                        </div>
                                    )}
                                    {job.KinhNghiem && (
                                        <div className="flex items-center text-gray-600">
                                            <TrendingUp size={16} className="mr-2 text-blue-600" />
                                            <span>{job.KinhNghiem}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center text-gray-600">
                                        <Calendar size={16} className="mr-2 text-orange-600" />
                                        <span>Hạn nộp: {formatDate(job.HanNop)}</span>
                                    </div>
                                </div>

                                <p className="text-gray-700 text-sm mb-4 line-clamp-3">
                                    {job.MoTaCongViec}
                                </p>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => navigate(`/recruitment/jobs/${job.MaTin}`)}
                                        className="btn-secondary flex-1 flex items-center justify-center"
                                    >
                                        <Eye size={18} className="mr-2" />
                                        Xem chi tiết
                                    </button>

                                    {isCandidate && !expired && (
                                        <button
                                            onClick={() => navigate(`/recruitment/jobs/${job.MaTin}/apply`)}
                                            className="btn-primary flex-1"
                                        >
                                            Ứng tuyển ngay
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Delete Modal */}
            {deleteModal.show && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Xác nhận xóa tin tuyển dụng
                        </h3>
                        <p className="text-gray-600 mb-2">
                            Bạn có chắc chắn muốn xóa tin tuyển dụng này không?
                        </p>
                        <div className="bg-gray-50 p-4 rounded mb-4">
                            <p><strong>Vị trí:</strong> {deleteModal.job?.ViTri}</p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteModal({ show: false, job: null })}
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

export default JobList;
