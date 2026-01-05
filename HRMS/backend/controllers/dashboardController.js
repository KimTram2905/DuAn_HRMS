const Dashboard = require('../models/Dashboard');

exports.getStats = async (req, res) => {
    try {
        const { phongBan } = req.query;

        const stats = await Dashboard.getStats({ phongBan });
        const employeesByDept = await Dashboard.getEmployeesByDepartment({ phongBan });
        const employeesByRole = await Dashboard.getEmployeesByRole();
        const newEmployees = await Dashboard.getNewEmployees({ phongBan });
        const attendanceStats = await Dashboard.getAttendanceByDepartment({ phongBan });

        res.json({
            totalEmployees: stats.totalEmployees,
            totalSalary: stats.totalSalary,
            totalLeave: stats.totalLeave,
            newEmployees,
            employeesByDepartment: employeesByDept,
            employeesByRole,
            attendanceStats
        });
    } catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};
