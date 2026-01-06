// pages/ApplyJob.jsx - NOTE: U4.2 - Ứng viên nộp hồ sơ ứng tuyển
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Upload, FileText, Briefcase } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const ApplyJob = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [job, setJob] = useState(null);
    const [formData, setFormData] = useState({
        hoTen: '',
        email: user?.email || '',
        soDienThoai: ''
    });
    const [cvFile, setCvFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        fetchJob();
    }, [id]);

    const fetchJob = async () => {
        try {
            const response = await api.get(`/recruitment/jobs/${id}`);
            setJob(response.data);

            // Kiểm tra hạn nộp
            const deadline = new Date(response.data.HanNop);
            const today = new Date();
            if (deadline < today) {
                alert('Tin tuyển dụng này đã hết hạn nộp');
                navigate('/recruitment/jobs');
            }
        } catch (error) {
            alert('Không thể tải thông tin tin tuyển dụng');
            navigate('/recruitment/jobs');
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.hoTen.trim()) {
            newErrors.hoTen = 'Vui lòng nhập họ tên';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Vui lòng nhập email';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Email không hợp lệ';
        }

        if (!formData.soDienThoai.trim()) {
            newErrors.soDienThoai = 'Vui lòng nhập số điện thoại';
        } else if (!/^0\d{9,10}$/.test(formData.soDienThoai)) {
            newErrors.soDienThoai = 'Số điện thoại không hợp lệ (10-11 số, bắt đầu bằng 0)';
        }

        if (!cvFile) {
            newErrors.cvFile = 'Vui lòng tải lên CV của bạn';
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
            const submitData = new FormData();
            submitData.append('hoTen', formData.hoTen);
            submitData.append('email', formData.email);
            submitData.append('soDienThoai', formData.soDienThoai);
            submitData.append('tinTuyenDungID', id);
            submitData.append('cv', cvFile);

            await api.post('/recruitment/apply', submitData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            alert('Nộp hồ sơ thành công! Chúng tôi sẽ liên hệ với bạn sớm.');
            navigate('/recruitment/my-applications');
        } catch (error) {
            alert(error.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Kiểm tra định dạng file
            const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
            if (!allowedTypes.includes(file.type)) {
                alert('Chỉ chấp nhận file PDF, DOC, DOCX');
                return;
            }

            // Kiểm tra kích thước file (max 10MB)
            if (file.size > 10 * 1024 * 1024) {
                alert('Kích thước file không được vượt quá 10MB');
                return;
            }

            setCvFile(file);
            if (errors.cvFile) {
                setErrors(prev => ({ ...prev, cvFile: '' }));
            }
        }
    };

    if (!job) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="p-8">

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Thông tin công việc */}
                <div className="lg:col-span-1">
                    <div className="card sticky top-8">
                        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                            <Briefcase size={24} className="mr-2 text-blue-600" />
                            Thông tin công việc
                        </h2>
                        
                        <div className="space-y-3">
                            <div>
                                <p className="text-sm text-gray-600">Vị trí</p>
                                <p className="font-medium text-gray-800">{job.ViTri}</p>
                            </div>

                            {job.MucLuong && (
                                <div>
                                    <p className="text-sm text-gray-600">Mức lương</p>
                                    <p className="font-medium text-gray-800">{job.MucLuong}</p>
                                </div>
                            )}

                            {job.KinhNghiem && (
                                <div>
                                    <p className="text-sm text-gray-600">Kinh nghiệm</p>
                                    <p className="font-medium text-gray-800">{job.KinhNghiem}</p>
                                </div>
                            )}

                            <div>
                                <p className="text-sm text-gray-600">Hạn nộp</p>
                                <p className="font-medium text-gray-800">
                                    {new Date(job.HanNop).toLocaleDateString('vi-VN')}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form ứng tuyển */}
                <div className="lg:col-span-2">
                    <div className="card">
                        <h1 className="text-3xl font-bold text-gray-800 mb-6">Nộp hồ sơ ứng tuyển</h1>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Họ và tên <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.hoTen}
                                    onChange={(e) => setFormData({ ...formData, hoTen: e.target.value })}
                                    className={`input-field ${errors.hoTen ? 'border-red-500' : ''}`}
                                    placeholder="Nhập họ và tên đầy đủ"
                                />
                                {errors.hoTen && <p className="text-red-500 text-sm mt-1">{errors.hoTen}</p>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className={`input-field ${errors.email ? 'border-red-500' : ''}`}
                                        placeholder="example@email.com"
                                    />
                                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Số điện thoại <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.soDienThoai}
                                        onChange={(e) => setFormData({ ...formData, soDienThoai: e.target.value })}
                                        className={`input-field ${errors.soDienThoai ? 'border-red-500' : ''}`}
                                        placeholder="0912345678"
                                    />
                                    {errors.soDienThoai && <p className="text-red-500 text-sm mt-1">{errors.soDienThoai}</p>}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tải lên CV <span className="text-red-500">*</span>
                                </label>
                                <div className={`border-2 border-dashed rounded-lg p-6 text-center ${errors.cvFile ? 'border-red-500' : 'border-gray-300'}`}>
                                    <input
                                        type="file"
                                        accept=".pdf,.doc,.docx"
                                        onChange={handleFileChange}
                                        className="hidden"
                                        id="cv-upload"
                                    />
                                    <label htmlFor="cv-upload" className="cursor-pointer">
                                        {cvFile ? (
                                            <div className="flex items-center justify-center text-green-600">
                                                <FileText size={24} className="mr-2" />
                                                <span>{cvFile.name}</span>
                                            </div>
                                        ) : (
                                            <div>
                                                <Upload size={48} className="mx-auto text-gray-400 mb-2" />
                                                <p className="text-gray-600">
                                                    Nhấn để chọn file CV
                                                </p>
                                                <p className="text-sm text-gray-500 mt-2">
                                                    PDF, DOC, DOCX (Tối đa 10MB)
                                                </p>
                                            </div>
                                        )}
                                    </label>
                                </div>
                                {errors.cvFile && <p className="text-red-500 text-sm mt-1">{errors.cvFile}</p>}
                            </div>

                            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                                <p className="text-sm text-blue-800">
                                    <strong>Lưu ý:</strong> Sau khi nộp hồ sơ, bạn có thể theo dõi trạng thái ứng tuyển trong phần "Hồ sơ của tôi"
                                </p>
                            </div>

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
                                    {loading ? 'Đang nộp...' : 'Nộp hồ sơ'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ApplyJob;