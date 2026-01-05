import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import LoadingSpinner from './components/common/LoadingSpinner';

// Auth Pages
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// Main Pages
import Dashboard from './pages/Dashboard';
import EmployeeList from './pages/EmployeeList';
import EmployeeView from './pages/EmployeeView';
import EmployeeForm from './pages/EmployeeForm';
import Permissions from './pages/Permissions';
import NotFound from './pages/NotFound';
import Profile from './pages/Profile';
import AttendanceCalendar from './pages/AttendanceCalendar';
import LeaveRequest from './pages/LeaveRequestForm';
import AttendanceManagement from './pages/AttendanceManagement';
import LeaveApproval from './pages/LeaveApproval';
import SalaryCalculation from './pages/SalaryCalculation';
import SalaryView from './pages/SalaryView';
import RewardManagement from './pages/RewardManagement';
import Register from './pages/Register';
// Thêm vào phần import
import JobList from './pages/JobList';
import CreateJob from './pages/CreateJob';
import JobDetail from './pages/JobDetail';
import ApplyJob from './pages/ApplyJob';
import MyApplications from './pages/MyApplications';
import RecruitmentManagement from './pages/RecruitmentManagement';
import ApplicationDetail from './pages/ApplicationDetail';

import Reports from './pages/Reports';
import SalaryManagement from './pages/SalaryManagement';


// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useAuth();

    if (loading) return <LoadingSpinner />;
    if (!user) return <Navigate to="/login" replace />;
    if (allowedRoles && !allowedRoles.includes(user.vaiTro)) return <Navigate to="/dashboard" replace />;

    return children;
};

// Public Route Component (redirect if logged in)
const PublicRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) return <LoadingSpinner />;
    if (user) return <Navigate to="/dashboard" replace />;

    return children;
};

function App() {
    return (
        <Router>
            <AuthProvider>
                <Routes>
                    {/* Public Routes */}
                    <Route
                        path="/login"
                        element={<PublicRoute><Login /></PublicRoute>}
                    />
                    <Route
                        path="/register"
                        element={<PublicRoute><Register /></PublicRoute>}
                    />
                    <Route
                        path="/forgot-password"
                        element={<PublicRoute><ForgotPassword /></PublicRoute>}
                    />
                    <Route
                        path="/reset-password"
                        element={<PublicRoute><ResetPassword /></PublicRoute>}
                    />

                    {/* Protected Routes */}
                    <Route
                        path="/"
                        element={<ProtectedRoute><Layout /></ProtectedRoute>}
                    >
                        <Route index element={<Navigate to="/dashboard" replace />} />

                        {/* Dashboard - Admin only */}
                        <Route
                            path="dashboard"
                            element={<ProtectedRoute allowedRoles={['Admin']}><Dashboard /></ProtectedRoute>}
                        />

                        {/* Profile - All authenticated users */}
                        <Route
                            path="profile"
                            element={<ProtectedRoute><Profile /></ProtectedRoute>}
                        />

                        {/* Employees - Admin & Manager */}
                        <Route
                            path="employees"
                            element={<ProtectedRoute allowedRoles={['Admin', 'Manager']}><EmployeeList /></ProtectedRoute>}
                        />
                        <Route
                            path="employees/add"
                            element={<ProtectedRoute allowedRoles={['Admin']}><EmployeeForm /></ProtectedRoute>}
                        />
                        <Route
                            path="employees/edit/:id"
                            element={<ProtectedRoute allowedRoles={['Admin', 'Manager']}><EmployeeForm /></ProtectedRoute>}
                        />
                        <Route
                            path="employees/:id"
                            element={<ProtectedRoute allowedRoles={['Admin', 'Manager', 'Employee']}><EmployeeView /></ProtectedRoute>}
                        />

                        {/* Attendance & Leave - All roles (Admin sẽ thấy thông báo trong component) */}
                        <Route
                            path="attendance"
                            element={<ProtectedRoute><AttendanceCalendar /></ProtectedRoute>}
                        />
                        <Route
                            path="attendance-management"
                            element={<ProtectedRoute allowedRoles={['Admin', 'Manager']}><AttendanceManagement /></ProtectedRoute>}
                        />
                        <Route
                            path="leave"
                            element={<ProtectedRoute><LeaveRequest /></ProtectedRoute>}
                        />
                        <Route
                            path="leave-approval"
                            element={<ProtectedRoute allowedRoles={['Admin', 'Manager']}><LeaveApproval /></ProtectedRoute>}
                        />

                        {/* Permissions - Admin only */}
                        <Route
                            path="permissions"
                            element={<ProtectedRoute allowedRoles={['Admin']}><Permissions /></ProtectedRoute>}
                        />

                        {/* Placeholder routes for other modules */}
                        <Route 
                            path="/salary/calculate" 
                            element={<ProtectedRoute allowedRoles={['Admin', 'Manager']}><SalaryCalculation /></ProtectedRoute>} 
                        />
                        <Route
                            path="salary/view"
                            element={<ProtectedRoute allowedRoles={['Employee', 'Manager']}><SalaryView /></ProtectedRoute>}
                        />
                        <Route
                            path="salary/export"
                            element={<ProtectedRoute allowedRoles={['Admin', 'Manager']}><SalaryManagement /></ProtectedRoute>}
                        />

                        <Route
                            path="rewards"
                            element={<ProtectedRoute allowedRoles={['Manager']}><RewardManagement /></ProtectedRoute>}
                        />
                        
                        <Route
    path="recruitment/jobs"
    element={<ProtectedRoute><JobList /></ProtectedRoute>}
/>
<Route
    path="recruitment/jobs/create"
    element={<ProtectedRoute allowedRoles={['Manager', 'Admin']}><CreateJob /></ProtectedRoute>}
/>
<Route
    path="recruitment/jobs/edit/:id"
    element={<ProtectedRoute allowedRoles={['Manager', 'Admin']}><CreateJob /></ProtectedRoute>}
/>
<Route
    path="recruitment/jobs/:id"
    element={<ProtectedRoute><JobDetail /></ProtectedRoute>}
/>
<Route
    path="recruitment/jobs/:id/apply"
    element={<ProtectedRoute allowedRoles={['Candidate']}><ApplyJob /></ProtectedRoute>}
/>
<Route
    path="recruitment/my-applications"
    element={<ProtectedRoute allowedRoles={['Candidate']}><MyApplications /></ProtectedRoute>}
/>
<Route
    path="recruitment/management"
    element={<ProtectedRoute allowedRoles={['Manager', 'Admin']}><RecruitmentManagement /></ProtectedRoute>}
/>
<Route
    path="recruitment/applications/:id"
    element={<ProtectedRoute allowedRoles={['Manager', 'Admin']}><ApplicationDetail /></ProtectedRoute>}
/>
                        
                        <Route path="reports" element={<ProtectedRoute allowedRoles={['Admin', 'Manager']}><Reports /></ProtectedRoute>} />

                        {/* Nested 404 */}
                        <Route path="*" element={<NotFound />} />
                    </Route>

                    {/* Top-level 404 */}
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </AuthProvider>
        </Router>
    );
}

export default App;