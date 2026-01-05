import { useState, useEffect } from 'react';
import { Check, X, Clock } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const LeaveApproval = () => {
    const { user } = useAuth();
    const [leaveRequests, setLeaveRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showActionModal, setShowActionModal] = useState(false);
    const [actionType, setActionType] = useState('');

    useEffect(() => {
        fetchLeaveRequests();
    }, []);

    const fetchLeaveRequests = async () => {
        try {
            setLoading(true);
            const response = await api.get('/leave/approval');
            setLeaveRequests(response.data);
        } catch (error) {
            console.error('Error fetching leave requests:', error);
            alert('Không thể tải danh sách đơn xin nghỉ phép');
        } finally {
            setLoading(false);
        }
    };

    const handleAction = (request, action) => {
        // Kiểm tra quyền: Manager không phê duyệt chính mình
        if (user.vaiTro === 'Manager' && request.NhanVienID === user.maNhanVien) {
            alert('Bạn không thể phê duyệt đơn của chính mình');
            return;
        }
        setSelectedRequest(request);
        setActionType(action);
        setShowActionModal(true);
    };

    const handleSubmitAction = async () => {
        try {
            await api.put(`/leave/approval/${selectedRequest.MaNghiPhep}`, {
                action: actionType
            });

            alert('Cập nhật trạng thái đơn nghỉ thành công');
            setShowActionModal(false);
            setSelectedRequest(null);
            fetchLeaveRequests();
        } catch (error) {
            alert(error.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'DangCho': return 'bg-yellow-100 text-yellow-800';
            case 'DaDuyet': return 'bg-green-100 text-green-800';
            case 'TuChoi': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'DangCho': return 'Đang chờ';
            case 'DaDuyet': return 'Đã duyệt';
            case 'TuChoi': return 'Từ chối';
            default: return status;
        }
    };

    const getLoaiNghiText = (loaiNghi) => {
        switch (loaiNghi) {
            case 'PhepNam': return 'Phép năm';
            case 'Om': return 'Ốm';
            case 'ViecRieng': return 'Việc riêng';
            default: return loaiNghi;
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Phê duyệt nghỉ phép</h1>
            <p className="text-gray-600 mb-8">
                {user.vaiTro === 'Manager' 
                    ? 'Phê duyệt đơn xin nghỉ phép của nhân viên trong phòng ban của bạn'
                    : 'Phê duyệt đơn xin nghỉ phép toàn hệ thống'
                }
            </p>

            <div className="card">
                {loading ? (
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                        <p className="mt-2 text-gray-600">Đang tải...</p>
                    </div>
                ) : leaveRequests.length === 0 ? (
                    <div className="text-center py-8">
                        <Clock size={48} className="mx-auto text-gray-300 mb-3" />
                        <p className="text-gray-500">Không có đơn nghỉ chờ xử lý</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-blue-100">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã NV</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Họ tên</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loại nghỉ</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày bắt đầu</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày kết thúc</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Số ngày</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lý do</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hành động</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {leaveRequests.map(request => (
                                    <tr key={request.MaNghiPhep} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                            {request.MaNhanVien}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {request.HoTen}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {getLoaiNghiText(request.LoaiNghi)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {formatDate(request.NgayBatDau)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {formatDate(request.NgayKetThuc)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {request.SoNgay} ngày
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                                            <div className="truncate" title={request.LyDo}>
                                                {request.LyDo}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(request.TrangThai)}`}>
                                                {getStatusText(request.TrangThai)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium space-x-2">
                                            <button
                                                onClick={() => handleAction(request, 'approve')}
                                                className="text-green-600 hover:text-green-900"
                                                title="Phê duyệt"
                                            >
                                                <Check size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleAction(request, 'reject')}
                                                className="text-red-600 hover:text-red-900"
                                                title="Từ chối"
                                            >
                                                <X size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Action Modal */}
            {showActionModal && selectedRequest && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                {actionType === 'approve' ? 'Phê duyệt đơn nghỉ phép' : 'Từ chối đơn nghỉ phép'}
                            </h3>
                            
                            <div className="space-y-4 mb-4">
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <p className="text-sm text-gray-600">Nhân viên</p>
                                    <p className="font-medium text-gray-800">
                                        {selectedRequest.HoTen}
                                    </p>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <p className="text-sm text-gray-600">Thời gian nghỉ</p>
                                    <p className="font-medium text-gray-800">
                                        {formatDate(selectedRequest.NgayBatDau)} - {formatDate(selectedRequest.NgayKetThuc)}
                                    </p>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <p className="text-sm text-gray-600">Lý do</p>
                                    <p className="font-medium text-gray-800">
                                        {selectedRequest.LyDo}
                                    </p>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-4 pt-4">
                                <button
                                    onClick={() => setShowActionModal(false)}
                                    className="btn-secondary"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleSubmitAction}
                                    className="btn-primary"
                                >
                                    {actionType === 'approve' ? 'Phê duyệt' : 'Từ chối'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LeaveApproval;