import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Upload } from 'lucide-react';
import api from '../services/api';

const EmployeeForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);
    
    const [formData, setFormData] = useState({
        hoTen: '',
        ngaySinh: '',
        diaChi: '',
        soDienThoai: '',
        email: '',
        gioiTinh: 'Nam',
        phongBanID: '',
        chucVuID: '',
        loaiHopDong: 'ChinhThuc',
        ngayBatDauHopDong: '',
        ngayKetThucHopDong: '',
        luongCoBan: ''
    });
    
    const [avatar, setAvatar] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [departments, setDepartments] = useState([]);
    const [positions, setPositions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        fetchDepartments();
        fetchPositions();
        if (isEdit) {
            fetchEmployee();
        }
    }, [id]);

    const fetchDepartments = async () => {
        try {
            const response = await api.get('/employees/data/departments');
            setDepartments(response.data);
        } catch (error) {
            console.error('Error fetching departments:', error);
        }
    };

    const fetchPositions = async () => {
        try {
            const response = await api.get('/employees/data/positions');
            setPositions(response.data);
        } catch (error) {
            console.error('Error fetching positions:', error);
        }
    };

    const fetchEmployee = async () => {
        try {
            const response = await api.get(`/employees/${id}`);
            const emp = response.data;
            setFormData({
                hoTen: emp.HoTen || '',
                ngaySinh: emp.NgaySinh ? emp.NgaySinh.split('T')[0] : '',
                diaChi: emp.DiaChi || '',
                soDienThoai: emp.SoDienThoai || '',
                email: emp.Email || '',
                gioiTinh: emp.GioiTinh || 'Nam',
                phongBanID: emp.PhongBanID || '',
                chucVuID: emp.ChucVuID || '',
                loaiHopDong: emp.LoaiHopDong || 'ChinhThuc',
                ngayBatDauHopDong: emp.NgayBatDauHopDong ? emp.NgayBatDauHopDong.split('T')[0] : '',
                ngayKetThucHopDong: emp.NgayKetThucHopDong ? emp.NgayKetThucHopDong.split('T')[0] : '',
                luongCoBan: emp.LuongCoBan || ''
            });
            if (emp.AnhDaiDien) {
                setAvatarPreview(`http://localhost:5000${emp.AnhDaiDien}`);
            }
        } catch (error) {
            console.error('Error fetching employee:', error);
            alert('Không thể tải thông tin nhân viên');
            navigate('/employees');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert('Kích thước file không được vượt quá 5MB');
                return;
            }
            if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
                alert('Chỉ chấp nhận file ảnh (jpg, png)');
                return;
            }
            setAvatar(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.hoTen.trim()) {
            newErrors.hoTen = 'Vui lòng nhập họ tên';
        }

        if (!formData.ngaySinh) {
            newErrors.ngaySinh = 'Vui lòng chọn ngày sinh';
        } else {
            const birthDate = new Date(formData.ngaySinh);
            const age = (new Date() - birthDate) / (365.25 * 24 * 60 * 60 * 1000);
            if (age < 18) {
                newErrors.ngaySinh = 'Nhân viên phải từ 18 tuổi trở lên';
            }
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

        if (!formData.phongBanID) {
            newErrors.phongBanID = 'Vui lòng chọn phòng ban';
        }

        if (!formData.chucVuID) {
            newErrors.chucVuID = 'Vui lòng chọn chức vụ';
        }

        if (!formData.ngayBatDauHopDong) {
            newErrors.ngayBatDauHopDong = 'Vui lòng chọn ngày bắt đầu hợp đồng';
        }

        if (!formData.luongCoBan || formData.luongCoBan <= 0) {
            newErrors.luongCoBan = 'Vui lòng nhập lương cơ bản hợp lệ';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            alert('Vui lòng điền đầy đủ thông tin bắt buộc');
            return;
        }

        setLoading(true);

        try {
            const submitData = new FormData();
            Object.keys(formData).forEach(key => {
                if (formData[key]) {
                    submitData.append(key, formData[key]);
                }
            });

            if (avatar) {
                submitData.append('avatar', avatar);
            }

            if (isEdit) {
                await api.put(`/employees/${id}`, submitData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                alert('Cập nhật thông tin nhân viên thành công');
            } else {
                await api.post('/employees', submitData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                alert('Thêm nhân viên thành công');
            }

            navigate('/employees');
        } catch (error) {
            alert(error.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

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

            <div className="card max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">
                    {isEdit ? 'Sửa thông tin nhân viên' : 'Thêm nhân viên mới'}
                </h1>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Avatar Upload */}
                    <div className="text-center">
                        <div className="mb-4">
                            {avatarPreview ? (
                                <img
                                    src={avatarPreview}
                                    alt="Avatar preview"
                                    className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-blue-100"
                                />
                            ) : (
                                <div className="w-32 h-32 rounded-full mx-auto bg-gray-200 flex items-center justify-center text-gray-400 text-5xl">
                                    <Upload />
                                </div>
                            )}
                        </div>
                        <label className="btn-primary inline-flex items-center cursor-pointer">
                            <Upload size={20} className="mr-2" />
                            Tải ảnh lên
                            <input
                                type="file"
                                accept="image/jpeg,image/jpg,image/png"
                                onChange={handleAvatarChange}
                                className="hidden"
                            />
                        </label>
                        <p className="text-sm text-gray-500 mt-2">JPG, PNG (Tối đa 5MB)</p>
                    </div>

                    {/* Personal Information */}
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b">
                            Thông tin cá nhân
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Họ và tên <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="hoTen"
                                    value={formData.hoTen}
                                    onChange={handleInputChange}
                                    className={`input-field ${errors.hoTen ? 'border-red-500' : ''}`}
                                    placeholder="Nhập họ và tên"
                                />
                                {errors.hoTen && <p className="text-red-500 text-sm mt-1">{errors.hoTen}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Ngày sinh <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    name="ngaySinh"
                                    value={formData.ngaySinh}
                                    onChange={handleInputChange}
                                    className={`input-field ${errors.ngaySinh ? 'border-red-500' : ''}`}
                                />
                                {errors.ngaySinh && <p className="text-red-500 text-sm mt-1">{errors.ngaySinh}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
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
                                    name="soDienThoai"
                                    value={formData.soDienThoai}
                                    onChange={handleInputChange}
                                    className={`input-field ${errors.soDienThoai ? 'border-red-500' : ''}`}
                                    placeholder="0123456789"
                                />
                                {errors.soDienThoai && <p className="text-red-500 text-sm mt-1">{errors.soDienThoai}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Giới tính <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="gioiTinh"
                                    value={formData.gioiTinh}
                                    onChange={handleInputChange}
                                    className="input-field"
                                >
                                    <option value="Nam">Nam</option>
                                    <option value="Nu">Nữ</option>
                                    <option value="Khac">Khác</option>
                                </select>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Địa chỉ
                                </label>
                                <textarea
                                    name="diaChi"
                                    value={formData.diaChi}
                                    onChange={handleInputChange}
                                    className="input-field"
                                    rows="2"
                                    placeholder="Nhập địa chỉ đầy đủ"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Work Information */}
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b">
                            Thông tin công việc
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Phòng ban <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="phongBanID"
                                    value={formData.phongBanID}
                                    onChange={handleInputChange}
                                    className={`input-field ${errors.phongBanID ? 'border-red-500' : ''}`}
                                >
                                    <option value="">-- Chọn phòng ban --</option>
                                    {departments.map(dept => (
                                        <option key={dept.MaPhongBan} value={dept.MaPhongBan}>
                                            {dept.TenPhongBan}
                                        </option>
                                    ))}
                                </select>
                                {errors.phongBanID && <p className="text-red-500 text-sm mt-1">{errors.phongBanID}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Chức vụ <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="chucVuID"
                                    value={formData.chucVuID}
                                    onChange={handleInputChange}
                                    className={`input-field ${errors.chucVuID ? 'border-red-500' : ''}`}
                                >
                                    <option value="">-- Chọn chức vụ --</option>
                                    {positions.map(pos => (
                                        <option key={pos.MaChucVu} value={pos.MaChucVu}>
                                            {pos.TenChucVu}
                                        </option>
                                    ))}
                                </select>
                                {errors.chucVuID && <p className="text-red-500 text-sm mt-1">{errors.chucVuID}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Loại hợp đồng <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="loaiHopDong"
                                    value={formData.loaiHopDong}
                                    onChange={handleInputChange}
                                    className="input-field"
                                >
                                    <option value="ThuViec">Thử việc</option>
                                    <option value="ChinhThuc">Chính thức</option>
                                    <option value="CTV">Cộng tác viên</option>
                                    <option value="Khac">Khác</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Lương cơ bản (VND) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    name="luongCoBan"
                                    value={formData.luongCoBan}
                                    onChange={handleInputChange}
                                    className={`input-field ${errors.luongCoBan ? 'border-red-500' : ''}`}
                                    placeholder="0"
                                    min="0"
                                />
                                {errors.luongCoBan && <p className="text-red-500 text-sm mt-1">{errors.luongCoBan}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Ngày bắt đầu hợp đồng <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    name="ngayBatDauHopDong"
                                    value={formData.ngayBatDauHopDong}
                                    onChange={handleInputChange}
                                    className={`input-field ${errors.ngayBatDauHopDong ? 'border-red-500' : ''}`}
                                />
                                {errors.ngayBatDauHopDong && <p className="text-red-500 text-sm mt-1">{errors.ngayBatDauHopDong}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Ngày kết thúc hợp đồng
                                </label>
                                <input
                                    type="date"
                                    name="ngayKetThucHopDong"
                                    value={formData.ngayKetThucHopDong}
                                    onChange={handleInputChange}
                                    className="input-field"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-4 pt-6 border-t">
                        <button
                            type="button"
                            onClick={() => navigate('/employees')}
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
                            {loading ? 'Đang xử lý...' : (isEdit ? 'Cập nhật' : 'Thêm mới')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EmployeeForm;