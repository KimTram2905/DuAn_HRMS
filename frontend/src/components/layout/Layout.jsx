import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout = () => {
    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar cố định */}
            <Sidebar />

            {/* Nội dung chính, có padding để tránh bị che */}
            <main className="flex-1 ml-64 overflow-auto">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;