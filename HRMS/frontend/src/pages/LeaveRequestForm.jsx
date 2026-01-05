import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const LeaveRequestForm = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    loaiNghi: 'PhepNam',
    ngayBatDau: '',
    ngayKetThuc: '',
    lyDo: ''
  });
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const maxLyDoLength = 200;

  // Kiểm tra nếu user là Admin thì hiển thị thông báo
  if (user?.vaiTro === 'Admin') {
    return (
        <div className="p-8">
            <div className="card max-w-4xl mx-auto text-center py-12">
                <div className="text-yellow-600 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Không có quyền truy cập</h2>
                <p className="text-gray-600 mb-6">
                    Quản trị viên không có chức năng xin nghỉ phép. 
                    Vui lòng sử dụng các tính năng quản lý khác trong hệ thống.
                </p>
                <button
                    onClick={() => window.history.back()}
                    className="btn-primary"
                >
                    Quay lại
                </button>
            </div>
        </div>
    );
  }

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await api.get('/leave/my-requests');
      setRequests(response.data);
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/leave/request', formData);
      alert('Yêu cầu nghỉ phép đã được gửi');
      setFormData({ loaiNghi: 'PhepNam', ngayBatDau: '', ngayKetThuc: '', lyDo: '' });
      fetchRequests();
    } catch (error) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'DangCho':
        return 'bg-yellow-100 text-yellow-800';
      case 'DaDuyet':
        return 'bg-green-100 text-green-800';
      case 'TuChoi':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Xin nghỉ phép</h1>
      <p className="text-gray-600">Tạo yêu cầu và xem lịch sử nghỉ phép của bạn</p>

      <div className="bg-white shadow-lg rounded-2xl p-8 mb-10 mt-10">
        <h2 className="text-2xl font-semibold mb-6 border-b pb-2 border-gray-200">Tạo yêu cầu nghỉ phép</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Loại nghỉ</label>
            <select
              value={formData.loaiNghi}
              onChange={(e) => setFormData({ ...formData, loaiNghi: e.target.value })}
              className="w-full border-gray-300 rounded-lg shadow-sm focus:ring focus:ring-indigo-200 focus:border-indigo-400 p-3"
              required
            >
              <option value="PhepNam">Phép năm</option>
              <option value="Om">Ốm</option>
              <option value="ViecRieng">Việc riêng</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ngày bắt đầu</label>
              <input
                type="date"
                value={formData.ngayBatDau}
                onChange={(e) => setFormData({ ...formData, ngayBatDau: e.target.value })}
                className="w-full border-gray-300 rounded-lg shadow-sm focus:ring focus:ring-indigo-200 focus:border-indigo-400 p-3"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ngày kết thúc</label>
              <input
                type="date"
                value={formData.ngayKetThuc}
                onChange={(e) => setFormData({ ...formData, ngayKetThuc: e.target.value })}
                className="w-full border-gray-300 rounded-lg shadow-sm focus:ring focus:ring-indigo-200 focus:border-indigo-400 p-3"
                required
              />
            </div>
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">Lý do</label>
            <textarea
              value={formData.lyDo}
              onChange={(e) => {
                if (e.target.value.length <= maxLyDoLength) {
                  setFormData({ ...formData, lyDo: e.target.value });
                }
              }}
              className="w-full border-gray-300 rounded-lg shadow-sm focus:ring focus:ring-indigo-200 focus:border-indigo-400 p-3 resize-none"
              rows="4"
              required
            />
            <span
              className={`absolute top-2 right-3 text-sm ${
                formData.lyDo.length >= maxLyDoLength * 0.8 ? 'text-red-500' : 'text-gray-400'
              }`}
            >
              {formData.lyDo.length}/{maxLyDoLength}
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg font-semibold text-white transition-colors ${
              loading ? 'bg-indigo-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {loading ? 'Đang gửi...' : 'Gửi yêu cầu'}
          </button>
        </form>
      </div>

      <div className="bg-white shadow-lg rounded-2xl p-8">
        <h2 className="text-2xl font-semibold mb-6 border-b pb-2 border-gray-200">Lịch sử yêu cầu nghỉ phép</h2>
        {requests.length === 0 ? (
          <p className="text-gray-500 text-center py-10">Chưa có yêu cầu nào</p>
        ) : (
          <div className="overflow-x-auto max-h-[500px]">
            <table className="min-w-full table-auto border-collapse">
              <thead className="bg-green-100 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Ngày gửi</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Loại nghỉ</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Ngày bắt đầu</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Ngày kết thúc</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Số ngày</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Lý do</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {requests.map((req) => (
                  <tr key={req.MaNghiPhep} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-600">{new Date(req.NgayTao).toLocaleDateString('vi-VN')}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{req.LoaiNghi}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{new Date(req.NgayBatDau).toLocaleDateString('vi-VN')}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{new Date(req.NgayKetThuc).toLocaleDateString('vi-VN')}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{req.SoNgay}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{req.LyDo}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(req.TrangThai)}`}>
                        {req.TrangThai === 'DangCho' ? 'Đang chờ' : req.TrangThai === 'DaDuyet' ? 'Đã duyệt' : 'Từ chối'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaveRequestForm;