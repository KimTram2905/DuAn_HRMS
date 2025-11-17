import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

const NotFound = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
            <div className="text-center">
                <h1 className="text-9xl font-bold text-white mb-4">404</h1>
                <h2 className="text-3xl font-semibold text-white mb-4">Trang không tìm thấy</h2>
                <p className="text-blue-100 mb-8">Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.</p>
                <Link
                    to="/dashboard"
                    className="inline-flex items-center bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                >
                    <Home size={20} className="mr-2" />
                    Về trang chủ
                </Link>
            </div>
        </div>
    );
};

export default NotFound;