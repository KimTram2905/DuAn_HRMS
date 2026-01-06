import { Link, useLocation } from 'react-router-dom';
import { 
    LayoutDashboard, Users, Clock, Calendar, 
    DollarSign, Briefcase, FileText, Shield, LogOut, Award,
    ChevronDown, ChevronRight
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useState } from 'react';

const Sidebar = () => {
    const location = useLocation();
    const { user, logout } = useAuth();

    const [openMenu, setOpenMenu] = useState(null);

    const toggleMenu = (menu) => {
        setOpenMenu(openMenu === menu ? null : menu);
    };

    const menuItems = [
        { path: '/dashboard', label: 'Tổng quan', icon: LayoutDashboard, roles: ['Admin'] },
        { path: '/employees', label: 'Nhân viên', icon: Users, roles: ['Admin', 'Manager'] },

        {
            label: 'Chấm công',
            icon: Clock,
            roles: ['Admin', 'Manager', 'Employee'],
            children: [
                { path: '/attendance', label: 'Xem lịch chấm công' },
                { path: '/attendance-management', label: 'Quản lý chấm công', roles: ['Admin', 'Manager'] },
            ]
        },

        {
            label: 'Nghỉ phép',
            icon: Calendar,
            roles: ['Admin', 'Manager', 'Employee'],
            children: [
                { path: '/leave', label: 'Xin nghỉ phép' },
                { path: '/leave-approval', label: 'Duyệt nghỉ phép', roles: ['Admin', 'Manager'] },
            ]
        },

        {
            label: 'Lương',
            icon: DollarSign,
            roles: ['Admin', 'Manager', 'Employee'],
            children: [
                { path: '/salary/calculate', label: 'Tính lương', roles: ['Admin', 'Manager'] },
                { path: '/salary/view', label: 'Xem bảng lương', roles: ['Manager', 'Employee'] },
                { path: '/salary/export', label: 'Xuất bảng lương', roles: ['Admin', 'Manager'] },
            ]
        },

        { path: '/rewards', label: 'Thưởng/Phạt', icon: Award , roles: ['Manager'] },
        {
            label: 'Tuyển dụng',
            icon: Briefcase,
            roles: ['Admin', 'Manager', 'Candidate'],
            children: [
                { path: '/recruitment/jobs', label: 'Danh sách tin tuyển dụng' },
                { path: '/recruitment/management', label: 'Quản lý hồ sơ', roles: ['Admin', 'Manager'] },
                { path: '/recruitment/my-applications', label: 'Hồ sơ của tôi', roles: ['Candidate'] },
            ]
        },
        { path: '/reports', label: 'Báo cáo', icon: FileText, roles: ['Admin', 'Manager'] },
        { path: '/permissions', label: 'Phân quyền', icon: Shield, roles: ['Admin'] },
    ];

    const filteredMenu = menuItems.filter(item => {
        if (!item.roles.includes(user?.vaiTro)) return false;

        if (item.children) {
            item.children = item.children.filter(child =>
                !child.roles || child.roles.includes(user?.vaiTro)
            );
            return item.children.length > 0;
        }
        return true;
    });

    const handleLogout = async () => {
        if (window.confirm('Bạn có chắc chắn muốn đăng xuất?')) {
            await logout();
        }
    };

    const isChildActive = (children) => {
        return children.some(child => location.pathname === child.path);
    };

    return (
        <div className="fixed left-0 top-0 w-64 h-screen bg-gradient-to-b from-blue-900 to-blue-800 text-white flex flex-col shadow-xl z-50">

            {/* Header */}
            <div className="p-6 border-b border-blue-700">
                <h1 className="text-2xl font-bold tracking-wider">HRMS</h1>
            </div>

            {/* User Info */}
            <div className="p-6 border-b border-blue-700">
                <Link to="/profile" className="flex items-center space-x-3 hover:bg-blue-700/30 p-2 rounded-lg transition-colors">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                        <Users size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-blue-200">Xin chào,</p>
                        <p className="font-semibold truncate">{user?.hoTen || user?.username}</p>
                    </div>
                </Link>
            </div>

            {/* Menu (Scroll Area) */}
            <nav className="flex-1 py-6 overflow-y-auto scrollbar-hide">
                {filteredMenu.map((item, index) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    const hasChildren = item.children && item.children.length > 0;
                    const isSubmenuActive = hasChildren && isChildActive(item.children);

                    if (hasChildren) {
                        return (
                            <div key={index}>
                                <button
                                    onClick={() => toggleMenu(item.label)}
                                    className={`flex items-center justify-between w-full px-6 py-3 transition-colors ${
                                        isSubmenuActive ? 'bg-blue-700' : 'hover:bg-blue-700/50'
                                    }`}
                                >
                                    <div className="flex items-center space-x-3">
                                        <Icon size={20} />
                                        <span>{item.label}</span>
                                    </div>
                                    {openMenu === item.label ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                                </button>

                                {openMenu === item.label && (
                                    <div className="ml-10 border-l border-blue-700">
                                        {item.children.map((child, idx) => {
                                            const childActive = location.pathname === child.path;
                                            return (
                                                <Link
                                                    key={idx}
                                                    to={child.path}
                                                    className={`block px-4 py-2 my-1 transition-colors ${
                                                        childActive ? "bg-blue-700" : "hover:bg-blue-700/30"
                                                    }`}
                                                >
                                                    {child.label}
                                                </Link>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    }

                    return (
                        <Link
                            key={index}
                            to={item.path}
                            className={`flex items-center space-x-3 px-6 py-3 transition-colors duration-200 ${
                                isActive
                                    ? 'bg-blue-700 border-l-4 border-white'
                                    : 'hover:bg-blue-700/50'
                            }`}
                        >
                            <Icon size={20} />
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Logout (Fixed at bottom) */}
            <div className="p-6 border-t border-blue-700">
                <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 w-full px-4 py-3 bg-red-600 hover:bg-red-700 rounded-lg transition-colors duration-200"
                >
                    <LogOut size={20} />
                    <span className="font-medium">Đăng xuất</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
