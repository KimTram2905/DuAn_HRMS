import { useState, useEffect } from 'react';
import { Edit, Trash2, Plus, X } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const RewardManagement = () => {
    const { user } = useAuth();
    const [rewards, setRewards] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [formData, setFormData] = useState({
        nhanVienID: '',
        loai: 'Thuong',
        soTien: '',
        lyDo: ''
    });
    const [showModal, setShowModal] = useState(false);  // State cho modal
    const [modalData, setModalData] = useState({});  // Dữ liệu cho modal
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchRewards();
        fetchEmployees();
    }, []);

    const fetchRewards = async () => {
        try {
            const response = await api.get('/rewards');
            setRewards(response.data);
        } catch (error) {
            console.error('Error fetching rewards:', error);
        }
    };

    const fetchEmployees = async () => {
        try {
            const response = await api.get('/employees');
            setEmployees(response.data);
        } catch (error) {
            console.error('Error fetching employees:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.nhanVienID || !formData.loai || !formData.soTien || !formData.lyDo) {
            alert('Vui lòng điền đầy đủ thông tin');
            return;
        }
        if (formData.soTien <= 0) {
            alert('Số tiền phải lớn hơn 0');
            return;
        }

        setLoading(true);
        try {
            await api.post('/rewards', formData);
            alert('Thêm mới thành công');
            fetchRewards();
            resetForm();
        } catch (error) {
            alert(error.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (reward) => {
        setModalData({
            id: reward.MaThuongPhat,
            nhanVienID: reward.NhanVienID,
            hoTen: reward.HoTen,  // Thêm tên nhân viên để hiển thị
            loai: reward.Loai,
            soTien: reward.SoTien,
            lyDo: reward.LyDo
        });
        setShowModal(true);
    };

    const handleModalSubmit = async (e) => {
        e.preventDefault();
        if (!modalData.loai || !modalData.soTien || !modalData.lyDo) {
            alert('Vui lòng điền đầy đủ thông tin');
            return;
        }
        if (modalData.soTien <= 0) {
            alert('Số tiền phải lớn hơn 0');
            return;
        }

        setLoading(true);
        try {
            await api.put(`/rewards/${modalData.id}`, {
                nhanVienID: modalData.nhanVienID,  // Giữ nguyên nhân viên
                loai: modalData.loai,
                soTien: modalData.soTien,
                lyDo: modalData.lyDo
            });
            alert('Cập nhật thành công');
            fetchRewards();
            setShowModal(false);
        } catch (error) {
            alert(error.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa khoản thưởng/phạt này?')) return;
        try {
            await api.delete(`/rewards/${id}`);
            alert('Xóa thành công');
            fetchRewards();
        } catch (error) {
            alert(error.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const resetForm = () => {
        setFormData({ nhanVienID: '', loai: 'Thuong', soTien: '', lyDo: '' });
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    };

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Quản lý Thưởng/Phạt</h1>
            <p className="text-gray-600 mb-8">Thêm, sửa, xóa khoản thưởng/phạt cho nhân viên</p>

            {/* Form Thêm mới */}
            <div className="card mb-8">
                <h2 className="text-xl font-semibold mb-6">Thêm khoản thưởng/phạt</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Nhân viên *</label>
                            <select
                                value={formData.nhanVienID}
                                onChange={(e) => setFormData({ ...formData, nhanVienID: e.target.value })}
                                className="input-field"
                                required
                            >
                                <option value="">-- Chọn nhân viên --</option>
                                {employees.map(emp => (
                                    <option key={emp.MaNhanVien} value={emp.MaNhanVien}>
                                        {emp.HoTen} ({emp.MaNhanVien})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Loại *</label>
                            <select
                                value={formData.loai}
                                onChange={(e) => setFormData({ ...formData, loai: e.target.value })}
                                className="input-field"
                                required
                            >
                                <option value="Thuong">Thưởng</option>
                                <option value="Phat">Phạt</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Số tiền (VND) *</label>
                        <input
                            type="number"
                            value={formData.soTien}
                            onChange={(e) => setFormData({ ...formData, soTien: e.target.value })}
                            className="input-field"
                            placeholder="0"
                            min="0"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Lý do *</label>
                        <textarea
                            value={formData.lyDo}
                            onChange={(e) => setFormData({ ...formData, lyDo: e.target.value })}
                            className="input-field"
                            rows="3"
                            placeholder="Mô tả lý do thưởng/phạt"
                            required
                        />
                    </div>
                    <div className="flex gap-4">
                        <button type="submit" className="btn-primary flex items-center" disabled={loading}>
                            <Plus size={20} className="mr-2" />
                            {loading ? 'Đang xử lý...' : 'Thêm mới'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Table */}
            <div className="card">
                <h2 className="text-xl font-semibold mb-6">Danh sách Thưởng/Phạt</h2>
                {rewards.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">Chưa có dữ liệu</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã NV</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Họ tên</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loại</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lý do</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Số tiền</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hành động</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {rewards.map(reward => (
                                    <tr key={reward.MaThuongPhat}>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{reward.MaNhanVien}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{reward.HoTen}</td>
                                        <td className="px-6 py-4 text-sm">
                                            <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                                                reward.Loai === 'Thuong' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                                {reward.Loai === 'Thuong' ? 'Thưởng' : 'Phạt'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{reward.LyDo}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                                            {formatCurrency(reward.SoTien)}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium space-x-2">
                                            <button
                                                onClick={() => handleEdit(reward)}
                                                className="text-blue-600 hover:text-blue-900"
                                                title="Sửa"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(reward.MaThuongPhat)}
                                                className="text-red-600 hover:text-red-900"
                                                title="Xóa"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal for Editing */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                        <div className="p-6">
                            <div className="mb-4">
                                <h3 className="text-lg font-semibold text-gray-800">Sửa khoản thưởng/phạt</h3>
                            </div>
                            <form onSubmit={handleModalSubmit} className="space-y-4">
                                {/* Hiển thị nhân viên cố định, không cho thay đổi */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Nhân viên</label>
                                    <input
                                        type="text"
                                        value={`${modalData.hoTen} (${modalData.nhanVienID})`}
                                        className="input-field bg-gray-100"
                                        readOnly
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Không thể thay đổi nhân viên khi sửa</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Loại *</label>
                                    <select
                                        value={modalData.loai}
                                        onChange={(e) => setModalData({ ...modalData, loai: e.target.value })}
                                        className="input-field"
                                        required
                                    >
                                        <option value="Thuong">Thưởng</option>
                                        <option value="Phat">Phạt</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Số tiền (VND) *</label>
                                    <input
                                        type="number"
                                        value={modalData.soTien}
                                        onChange={(e) => setModalData({ ...modalData, soTien: e.target.value })}
                                        className="input-field"
                                        placeholder="0"
                                        min="0"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Lý do *</label>
                                    <textarea
                                        value={modalData.lyDo}
                                        onChange={(e) => setModalData({ ...modalData, lyDo: e.target.value })}
                                        className="input-field"
                                        rows="3"
                                        placeholder="Mô tả lý do thưởng/phạt"
                                        required
                                    />
                                </div>
                                <div className="flex justify-end space-x-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="btn-secondary"
                                        disabled={loading}
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn-primary"
                                        disabled={loading}
                                    >
                                        {loading ? 'Đang lưu...' : 'Lưu'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RewardManagement;