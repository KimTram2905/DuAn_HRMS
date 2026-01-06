// pages/ApplicationDetail.jsx - NOTE: U4.4 - Xem chi tiết & cập nhật trạng thái hồ sơ
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, User, Mail, Phone, Calendar, Briefcase, Download, MessageSquare, Send } from 'lucide-react';
import api from '../services/api';

const ApplicationDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [application, setApplication] = useState(null);
    const [notes, setNotes] = useState([]);
    const [newNote, setNewNote] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchApplicationDetail();
    }, [id]);

    const fetchApplicationDetail = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/recruitment/applications/${id}`);
            setApplication(response.data.application);
            setNotes(response.data.notes);
            setSelectedStatus(response.data.application.TrangThai);
        } catch (error) {
            console.error('Error fetching application detail:', error);
            alert('Không thể tải thông tin hồ sơ');
            navigate('/recruitment/management');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async () => {
        if (selectedStatus === application.TrangThai) {
            alert('Vui lòng chọn trạng thái khác');
            return;
        }

        if (!window.confirm('Bạn có chắc chắn muốn cập nhật trạng thái hồ sơ này?')) {
            return;
        }

        setSubmitting(true);
        try {
            await api.put(`/recruitment/applications/${id}/status`, { status: selectedStatus });
            alert('Cập nhật trạng thái thành công');
            fetchApplicationDetail();
        } catch (error) {
            alert(error.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setSubmitting(false);
        }
    };

    const handleAddNote = async () => {
        if (!newNote.trim()) {
            alert('Vui lòng nhập nội dung ghi chú');
            return;
        }

        setSubmitting(true);
        try {
            await api.post(`/recruitment/applications/${id}/notes`, { noiDung: newNote });
            setNewNote('');
            fetchApplicationDetail();
            alert('Thêm ghi chú thành công');
        } catch (error) {
            alert(error.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDownloadCV = () => {
        window.open(`http://localhost:5000${application.DuongDanCV}`, '_blank');
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

    const formatDateTime = (dateString) => {
        return new Date(dateString).toLocaleString('vi-VN');
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
            </div>
        );
    }

    if (!application) {
        return (
            <div className="p-8">
                <div className="card text-center py-12">
                    <p className="text-gray-500 text-lg">Không tìm thấy hồ sơ</p>
                    <button onClick={() => navigate('/recruitment/management')} className="btn-primary mt-4">
                        Quay lại
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
                    onClick={() => navigate('/recruitment/management')}
                    className="inline-flex items-center text-blue-600 hover:text-blue-800"
                >
                    <ArrowLeft size={20} className="mr-2" />
                    Quay lại danh sách
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Candidate Info */}
                <div className="lg:col-span-1">
                    <div className="card sticky top-8">
                        <div className="text-center mb-6">
                            <div className="w-24 h-24 rounded-full mx-auto bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-4xl font-bold mb-4">
                                {application.HoTen.charAt(0).toUpperCase()}
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800">{application.HoTen}</h2>
                            <p className="text-gray-600">{application.ViTri}</p>
                            <span className={`inline-block mt-2 px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(application.TrangThai)}`}>
                                {getStatusText(application.TrangThai)}
                            </span>
                        </div>

                        <div className="border-t pt-6 space-y-4">
                            <h3 className="font-semibold text-gray-800 mb-4">Thông tin liên hệ</h3>
                            
                            <div className="flex items-start space-x-3">
                                <Mail size={20} className="text-blue-600 mt-1" />
                                <div>
                                    <p className="text-sm text-gray-600">Email</p>
                                    <p className="font-medium text-gray-800 break-all">{application.Email}</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3">
                                <Phone size={20} className="text-blue-600 mt-1" />
                                <div>
                                    <p className="text-sm text-gray-600">Số điện thoại</p>
                                    <p className="font-medium text-gray-800">{application.SoDienThoai}</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3">
                                <Calendar size={20} className="text-blue-600 mt-1" />
                                <div>
                                    <p className="text-sm text-gray-600">Ngày nộp</p>
                                    <p className="font-medium text-gray-800">{formatDate(application.NgayNop)}</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3">
                                <FileText size={20} className="text-blue-600 mt-1" />
                                <div>
                                    <p className="text-sm text-gray-600">Mã hồ sơ</p>
                                    <p className="font-medium text-gray-800">{application.MaHoSo}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-t">
                            <button
                                onClick={handleDownloadCV}
                                className="w-full btn-primary flex items-center justify-center"
                            >
                                <Download size={20} className="mr-2" />
                                Tải CV
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Column - Job Info & Actions */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Job Information */}
                    <div className="card">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4 pb-3 border-b flex items-center">
                            <Briefcase size={24} className="mr-2 text-blue-600" />
                            Thông tin vị trí ứng tuyển
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Vị trí</p>
                                <p className="font-semibold text-gray-800 text-lg">{application.ViTri}</p>
                            </div>

                            {application.MoTaCongViec && (
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Mô tả công việc</p>
                                    <p className="text-gray-700">{application.MoTaCongViec}</p>
                                </div>
                            )}

                            {application.YeuCauKyNang && (
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Yêu cầu kỹ năng</p>
                                    <p className="text-gray-700">{application.YeuCauKyNang}</p>
                                </div>
                            )}

                            {application.YeuCauBangCap && (
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Yêu cầu bằng cấp</p>
                                    <p className="text-gray-700">{application.YeuCauBangCap}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Update Status */}
                    <div className="card bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">Cập nhật trạng thái</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Trạng thái mới
                                </label>
                                <select
                                    value={selectedStatus}
                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                    className="input-field"
                                >
                                    <option value="Moi">Mới nộp</option>
                                    <option value="PhongVan">Chờ phỏng vấn</option>
                                    <option value="DaTuyen">Đã tuyển</option>
                                    <option value="TuChoi">Từ chối</option>
                                </select>
                            </div>

                            <button
                                onClick={handleUpdateStatus}
                                disabled={submitting || selectedStatus === application.TrangThai}
                                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {submitting ? 'Đang cập nhật...' : 'Cập nhật'}
                            </button>
                        </div>
                    </div>

                    {/* Notes Section */}
                    <div className="card">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4 pb-3 border-b flex items-center">
                            <MessageSquare size={24} className="mr-2 text-blue-600" />
                            Ghi chú đánh giá
                        </h3>

                        {/* Add Note */}
                        <div className="mb-6">
                            <textarea
                                value={newNote}
                                onChange={(e) => setNewNote(e.target.value)}
                                className="input-field"
                                rows="3"
                                placeholder="Nhập ghi chú về ứng viên (kỹ năng, ấn tượng, lưu ý...)..."
                            />
                            <button
                                onClick={handleAddNote}
                                disabled={submitting || !newNote.trim()}
                                className="btn-primary mt-3 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Send size={18} className="mr-2 inline" />
                                Thêm ghi chú
                            </button>
                        </div>

                        {/* Notes List */}
                        {notes.length === 0 ? (
                            <div className="text-center py-8 bg-gray-50 rounded-lg">
                                <MessageSquare size={48} className="mx-auto text-gray-300 mb-3" />
                                <p className="text-gray-500">Chưa có ghi chú nào</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {notes.map((note) => (
                                    <div key={note.MaGhiChu} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <p className="font-medium text-gray-800">
                                                    {note.NguoiCapNhat || note.TenDangNhap}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    {formatDateTime(note.ThoiGian)}
                                                </p>
                                            </div>
                                        </div>
                                        <p className="text-gray-700">{note.NoiDung}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ApplicationDetail;