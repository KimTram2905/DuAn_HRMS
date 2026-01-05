// pages/CreateJob.jsx - NOTE: U4.1 - Đăng tin tuyển dụng
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Briefcase } from 'lucide-react';
import api from '../services/api';

const CreateJob = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);

    const [formData, setFormData] = useState({
        viTri: '',
        mucLuong: '',
        kinhNghiem: '',
        yeuCauKyNang: '',
        yeuCauBangCap: '',
        moTaCongViec: '',
        hanNop: ''
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (isEdit) {
            fetchJob();
        }
    }, [id]);

    const fetchJob = async () => {
        try {
            const response = await api.get(`/recruitment/jobs/${id}`);
            const job = response.data;
            setFormData({
                viTri: job.ViTri || '',
                mucLuong: job.MucLuong || '',
                kinhNghiem: job.KinhNghiem || '',
                yeuCauKyNang: job.YeuCauKyNang || '',
                yeuCauBangCap: job.YeuCauBangCap || '',
                moTaCongViec: job.MoTaCongViec || '',
                hanNop: job.HanNop ? job.HanNop.split('T')[0] : ''
            });
        } catch (error) {
            alert('Không thể tải thông tin tin tuyển dụng');
            navigate('/recruitment/jobs');
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.viTri.trim()) {
            newErrors.viTri = 'Vui lòng nhập vị trí tuyển dụng';
        }

        if (!formData.moTaCongViec.trim()) {
            newErrors.moTaCongViec = 'Vui lòng nhập mô tả công việc';
        }

        if (!formData.hanNop) {
            newErrors.hanNop = 'Vui lòng chọn hạn nộp';
        } else {
            const deadline = new Date(formData.hanNop);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (deadline < today) {
                newErrors.hanNop = 'Hạn nộp phải từ hôm nay trở đi';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            alert('Vui lòng kiểm tra lại thông tin');
            return;
        }

        setLoading(true);

        try {
            if (isEdit) {
                await api.put(`/recruitment/jobs/${id}`, formData);
                alert('Cập nhật tin tuyển dụng thành công');
            } else {
                await api.post('/recruitment/jobs', formData);
                alert('Đăng tin tuyển dụng thành công');
            }
            navigate('/recruitment/jobs');
        } catch (error) {
            alert(error.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    return (
        <div className="p-8">
            <div className="card max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-800 mb-10 flex items-center">
                    {isEdit ? 'Sửa tin tuyển dụng' : 'Đăng tin tuyển dụng'}
                </h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Vị trí */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Vị trí tuyển dụng <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="viTri"
                            value={formData.viTri}
                            onChange={handleChange}
                            className={`input-field ${errors.viTri ? 'border-red-500' : ''}`}
                            placeholder="Ví dụ: Lập trình viên Java"
                        />
                        {errors.viTri && <p className="text-red-500 text-sm mt-1">{errors.viTri}</p>}
                    </div>

                    {/* Mức lương & Kinh nghiệm */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Mức lương
                            </label>
                            <input
                                type="text"
                                name="mucLuong"
                                value={formData.mucLuong}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="Ví dụ: 15-20 triệu"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Kinh nghiệm
                            </label>
                            <input
                                type="text"
                                name="kinhNghiem"
                                value={formData.kinhNghiem}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="Ví dụ: 2 năm kinh nghiệm"
                            />
                        </div>
                    </div>

                    {/* Yêu cầu */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Yêu cầu kỹ năng
                            </label>
                            <textarea
                                name="yeuCauKyNang"
                                value={formData.yeuCauKyNang}
                                onChange={handleChange}
                                className="input-field"
                                rows="3"
                                placeholder="Ví dụ: Java, Spring Boot, MySQL"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Yêu cầu bằng cấp
                            </label>
                            <textarea
                                name="yeuCauBangCap"
                                value={formData.yeuCauBangCap}
                                onChange={handleChange}
                                className="input-field"
                                rows="3"
                                placeholder="Ví dụ: Đại học CNTT"
                            />
                        </div>
                    </div>

                    {/* Mô tả công việc */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Mô tả công việc <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            name="moTaCongViec"
                            value={formData.moTaCongViec}
                            onChange={handleChange}
                            className={`input-field ${errors.moTaCongViec ? 'border-red-500' : ''}`}
                            rows="6"
                            placeholder="Mô tả chi tiết về công việc, trách nhiệm và quyền lợi..."
                        />
                        {errors.moTaCongViec && <p className="text-red-500 text-sm mt-1">{errors.moTaCongViec}</p>}
                    </div>

                    {/* Hạn nộp */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Hạn nộp hồ sơ <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            name="hanNop"
                            value={formData.hanNop}
                            onChange={handleChange}
                            className={`input-field ${errors.hanNop ? 'border-red-500' : ''}`}
                            min={new Date().toISOString().split('T')[0]}
                        />
                        {errors.hanNop && <p className="text-red-500 text-sm mt-1">{errors.hanNop}</p>}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-4 pt-6 border-t">
                        <button
                            type="button"
                            onClick={() => navigate('/recruitment/jobs')}
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
                            {loading ? 'Đang xử lý...' : (isEdit ? 'Cập nhật' : 'Đăng tin')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateJob;