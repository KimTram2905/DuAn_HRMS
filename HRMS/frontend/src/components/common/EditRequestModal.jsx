import { useState } from 'react';
import { X } from 'lucide-react';
import api from '../../services/api';

const EditRequestModal = ({ profile, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        fieldName: '',
        currentValue: '',
        newValue: '',
        reason: ''
    });
    const [loading, setLoading] = useState(false);

    const fieldOptions = [
        { value: 'HoTen', label: 'Họ và tên', current: profile.HoTen },
        { value: 'Email', label: 'Email', current: profile.Email },
        { value: 'SoDienThoai', label: 'Số điện thoại', current: profile.SoDienThoai },
        { value: 'DiaChi', label: 'Địa chỉ', current: profile.DiaChi },
        { value: 'NgaySinh', label: 'Ngày sinh', current: profile.NgaySinh?.split('T')[0] },
    ];

    const handleFieldChange = (e) => {
        const selectedField = fieldOptions.find(f => f.value === e.target.value);
        setFormData({
            ...formData,
            fieldName: e.target.value,
            currentValue: selectedField ? selectedField.current : ''
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.fieldName || !formData.newValue || !formData.reason) {
            alert('Vui lòng điền đầy đủ thông tin');
            return;
        }

        setLoading(true);

        try {
            await api.post('/profile/edit-request', formData);
            alert('Yêu cầu cập nhật thông tin đã được gửi thành công');
            onSuccess();
        } catch (error) {
            alert(error.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">Yêu cầu chỉnh sửa thông tin</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Trường thông tin cần sửa <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={formData.fieldName}
                                onChange={handleFieldChange}
                                className="input-field"
                                required
                            >
                                <option value="">-- Chọn trường thông tin --</option>
                                {fieldOptions.map(field => (
                                    <option key={field.value} value={field.value}>
                                        {field.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {formData.fieldName && (
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-sm text-gray-600 mb-1">Giá trị hiện tại:</p>
                                <p className="font-medium text-gray-800">
                                    {formData.currentValue || 'N/A'}
                                </p>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Giá trị mới
                            <span className="text-red-500">*</span>
                            </label>
                            {formData.fieldName === 'NgaySinh' ? (
                                <input
                                    type="date"
                                    value={formData.newValue}
                                    onChange={(e) => setFormData({ ...formData, newValue: e.target.value })}
                                    className="input-field"
                                    required
                                />
                            ) : (
                                <input
                                    type={formData.fieldName === 'Email' ? 'email' : 'text'}
                                    value={formData.newValue}
                                    onChange={(e) => setFormData({ ...formData, newValue: e.target.value })}
                                    className="input-field"
                                    placeholder="Nhập giá trị mới"
                                    required
                                />
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Lý do thay đổi <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={formData.reason}
                                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                className="input-field"
                                rows="4"
                                placeholder="Mô tả lý do bạn muốn thay đổi thông tin này..."
                                required
                            />
                            <p className="text-sm text-gray-500 mt-1">
                                Vui lòng giải thích rõ lý do để Quản trị viên có thể xem xét
                            </p>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-blue-800">
                                        Yêu cầu của bạn sẽ được gửi đến Quản trị viên để xem xét và phê duyệt. 
                                        Bạn sẽ nhận được thông báo khi yêu cầu được xử lý.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-4 pt-4 border-t">
                            <button
                                type="button"
                                onClick={onClose}
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
                                {loading ? 'Đang gửi...' : 'Gửi yêu cầu'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditRequestModal;