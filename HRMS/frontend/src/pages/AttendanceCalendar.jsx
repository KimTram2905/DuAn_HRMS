import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const AttendanceCalendar = () => {
    const { user } = useAuth();
    const [attendance, setAttendance] = useState([]);
    const [leaveDays, setLeaveDays] = useState([]);
    const [filterMode, setFilterMode] = useState('month');
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [loading, setLoading] = useState(false);
    const [monthsInRange, setMonthsInRange] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);

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
                        Quản trị viên không có chức năng chấm công. 
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
        if (filterMode === 'month') {
            fetchAttendance();
        }
    }, [currentMonth, currentYear, filterMode]);

    useEffect(() => {
        if (filterMode === 'range' && startDate && endDate) {
            fetchAttendance();
            const start = new Date(startDate);
            const end = new Date(endDate);
            const months = [];
            const current = new Date(start.getFullYear(), start.getMonth(), 1);
            while (current <= end) {
                months.push({ month: current.getMonth(), year: current.getFullYear() });
                current.setMonth(current.getMonth() + 1);
            }
            setMonthsInRange(months);
            setCurrentPage(0);
        }
    }, [startDate, endDate, filterMode]);

    const fetchAttendance = async () => {
        setLoading(true);
        try {
            let params = {};
            if (filterMode === 'month') {
                params = { month: currentMonth + 1, year: currentYear };
            } else if (filterMode === 'range') {
                params = { startDate, endDate };
            }
            const response = await api.get('/attendance/personal', { params });
            setAttendance(response.data.attendance);
            setLeaveDays(response.data.leaveDays);
        } catch (error) {
            console.error('Error fetching attendance:', error);
        } finally {
            setLoading(false);
        }
    };

    const getDaysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (month, year) => new Date(year, month, 1).getDay();

    const monthNames = [
        'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
        'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
    ];

    const renderCalendarForMonth = (month, year, startRange, endRange, showMonthTitle = false) => {
        const daysInMonth = getDaysInMonth(month, year);
        const firstDay = getFirstDayOfMonth(month, year);
        const days = [];

        for (let i = 0; i < firstDay; i++) {
            days.push(
                <div 
                    key={`empty-${month}-${year}-${i}`} 
                    className="h-16 md:h-20 border border-gray-200 bg-gray-50 rounded-md"
                ></div>
            );
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const isInRange = (!startRange || date >= startRange) && (!endRange || date <= endRange);
            const dayData = attendance.find(a => new Date(a.Ngay).toDateString() === date.toDateString());
            const leaveData = leaveDays.find(l => {
                const startLeave = new Date(l.NgayBatDau);
                const endLeave = new Date(l.NgayKetThuc);
                return date >= startLeave && date <= endLeave;
            });

            let bgColor = 'bg-gray-100';
            let textColor = 'text-gray-400';
            let content = 'Trống';
            let opacity = isInRange ? '' : 'opacity-50';

            if (leaveData && isInRange) {
                bgColor = 'bg-yellow-100';
                textColor = 'text-yellow-600';
                content = 'Nghỉ';
            } else if (dayData && isInRange) {
                bgColor = 'bg-green-100';
                textColor = 'text-green-600';
                content = `${dayData.GioVao || '--'}-${dayData.GioRa || '--'}\n${dayData.TongGioLam || 0}h`;
            }

            days.push(
                <div 
                    key={`${month}-${year}-${day}`} 
                    className={`h-16 md:h-20 border border-gray-200 p-1 md:p-2 ${bgColor} ${textColor} text-xs font-medium flex flex-col justify-center items-center hover:shadow-lg transition-shadow rounded-md ${opacity}`}
                >
                    <div className="font-bold text-sm md:text-base">{day}</div>
                    <div className="text-center whitespace-pre-line text-xs">{isInRange ? content : ''}</div>
                </div>
            );
        }

        return (
            <div className="mb-6 md:mb-8">
                {showMonthTitle && (
                    <h3 className="text-lg md:text-xl font-semibold mb-4 text-center text-gray-800">
                        {monthNames[month]} / {year}
                    </h3>
                )}

                <div className="grid grid-cols-7 gap-1 mb-2">
                    {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map(day => (
                        <div 
                            key={day} 
                            className="h-8 md:h-10 border border-gray-200 bg-blue-100 text-blue-800 font-semibold flex items-center justify-center text-xs md:text-sm rounded-md"
                        >
                            {day}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                    {days}
                </div>
            </div>
        );
    };

    const renderCalendar = () => {
        if (filterMode === 'range') {
            const start = startDate ? new Date(startDate) : null;
            const end = endDate ? new Date(endDate) : null;

            if (!start || !end) {
                return (
                    <div className="text-center py-8 text-gray-500 italic">
                        Vui lòng chọn khoảng thời gian muốn xem lịch chấm công
                    </div>
                );
            }

            if (monthsInRange.length === 0) return null;

            const { month, year } = monthsInRange[currentPage];

            return (
                <div>
                    <h3 className="text-lg md:text-xl font-semibold mb-4 text-left text-gray-800">
                        Lịch chấm công từ {start.toLocaleDateString('vi-VN')} đến {end.toLocaleDateString('vi-VN')}
                    </h3>

                    {renderCalendarForMonth(month, year, start, end, true)}

                    <div className="flex justify-center items-center mt-4 gap-4">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 0))}
                            disabled={currentPage === 0}
                            className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                        >
                            Trang trước
                        </button>
                        <span className="text-gray-700 font-medium">
                            Tháng {currentPage + 1} / {monthsInRange.length}
                        </span>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, monthsInRange.length - 1))}
                            disabled={currentPage === monthsInRange.length - 1}
                            className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                        >
                            Trang sau
                        </button>
                    </div>
                </div>
            );
        } else {
            return renderCalendarForMonth(currentMonth, currentYear, null, null, false);
        }
    };

    const changeMonth = (direction) => {
        if (direction === 'prev') {
            if (currentMonth === 0) {
                setCurrentMonth(11);
                setCurrentYear(currentYear - 1);
            } else {
                setCurrentMonth(currentMonth - 1);
            }
        } else {
            if (currentMonth === 11) {
                setCurrentMonth(0);
                setCurrentYear(currentYear + 1);
            } else {
                setCurrentMonth(currentMonth + 1);
            }
        }
    };

    return (
        <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Lịch chấm công cá nhân</h1>
            <p className="text-gray-600">Xem lịch chấm công cá nhân của bạn</p>
            <div className="card max-w-7xl mx-auto bg-white shadow-lg rounded-lg p-6 mt-10">
                <div className="mb-6">
                    <div className="flex flex-col md:flex-row items-start md:items-center space-y-2 md:space-y-0 md:space-x-4 mb-4">
                        <label className="flex items-center">
                            <input
                                type="radio"
                                value="month"
                                checked={filterMode === 'month'}
                                onChange={(e) => setFilterMode(e.target.value)}
                                className="mr-2"
                            />
                            Theo tháng
                        </label>
                        <label className="flex items-center">
                            <input
                                type="radio"
                                value="range"
                                checked={filterMode === 'range'}
                                onChange={(e) => setFilterMode(e.target.value)}
                                className="mr-2"
                            />
                            Theo khoảng thời gian
                        </label>
                    </div>

                    {filterMode === 'month' && (
                        <div className="flex justify-between items-center mb-4">
                            <button
                                onClick={() => changeMonth('prev')}
                                className="btn-secondary px-3 md:px-4 py-2 rounded-md shadow hover:shadow-md transition"
                                aria-label="Tháng trước"
                            >
                                ‹ Tháng trước
                            </button>
                            <h2 className="text-lg md:text-xl font-semibold text-gray-800">{monthNames[currentMonth]} / {currentYear}</h2>
                            <button
                                onClick={() => changeMonth('next')}
                                className="btn-secondary px-3 md:px-4 py-2 rounded-md shadow hover:shadow-md transition"
                                aria-label="Tháng sau"
                            >
                                Tháng sau ›
                            </button>
                        </div>
                    )}

                    {filterMode === 'range' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Từ ngày</label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="input-field w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Đến ngày</label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="input-field w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {loading ? (
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                        <p className="mt-2 text-gray-600">Đang tải...</p>
                    </div>
                ) : (
                    renderCalendar()
                )}

                <div className="mt-6 text-sm text-gray-600 flex flex-wrap justify-center md:justify-start gap-4">
                    <p className="flex items-center">
                        <span className="inline-block w-4 h-4 bg-green-100 mr-2 border rounded"></span>Ngày làm việc
                    </p>
                    <p className="flex items-center">
                        <span className="inline-block w-4 h-4 bg-yellow-100 mr-2 border rounded"></span>Ngày nghỉ phép
                    </p>
                    <p className="flex items-center">
                        <span className="inline-block w-4 h-4 bg-gray-100 mr-2 border rounded"></span>Ngày trống
                    </p>
                    <p className="text-gray-500 italic">Ngày ngoài khoảng thời gian sẽ được làm mờ</p>
                </div>
            </div>
        </div>
    );
};

export default AttendanceCalendar;