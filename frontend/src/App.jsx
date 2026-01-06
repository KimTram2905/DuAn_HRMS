import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Layout from "./components/layout/Layout";
import LoadingSpinner from "./components/common/LoadingSpinner";

// Auth Pages
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Register from "./pages/Register";

// Main Pages (thực tế)
import SalaryCalculation from "./pages/SalaryCalculation";
import SalaryView from "./pages/SalaryView";

// Placeholder page
const PlaceholderPage = () => {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-800">
        Chức năng chưa phát triển
      </h1>
      <p className="text-gray-600 mt-2">
        Tính năng này hiện đang trong quá trình phát triển. Vui lòng thử lại
        sau.
      </p>
    </div>
  );
};

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.vaiTro))
    return <Navigate to="/dashboard" replace />;

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
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <PublicRoute>
                <ForgotPassword />
              </PublicRoute>
            }
          />
          <Route
            path="/reset-password"
            element={
              <PublicRoute>
                <ResetPassword />
              </PublicRoute>
            }
          />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />

            {/* Dashboard */}
            <Route
              path="dashboard"
              element={
                <ProtectedRoute allowedRoles={["Admin"]}>
                  <PlaceholderPage />
                </ProtectedRoute>
              }
            />

            {/* Profile */}
            <Route
              path="profile"
              element={
                <ProtectedRoute>
                  <PlaceholderPage />
                </ProtectedRoute>
              }
            />

            {/* Employees */}
            <Route
              path="employees"
              element={
                <ProtectedRoute allowedRoles={["Admin", "Manager"]}>
                  <PlaceholderPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="employees/add"
              element={
                <ProtectedRoute allowedRoles={["Admin"]}>
                  <PlaceholderPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="employees/edit/:id"
              element={
                <ProtectedRoute allowedRoles={["Admin", "Manager"]}>
                  <PlaceholderPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="employees/:id"
              element={
                <ProtectedRoute allowedRoles={["Admin", "Manager", "Employee"]}>
                  <PlaceholderPage />
                </ProtectedRoute>
              }
            />

            {/* Attendance & Leave */}
            <Route
              path="attendance"
              element={
                <ProtectedRoute>
                  <PlaceholderPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="attendance-management"
              element={
                <ProtectedRoute allowedRoles={["Admin", "Manager"]}>
                  <PlaceholderPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="leave"
              element={
                <ProtectedRoute>
                  <PlaceholderPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="leave-approval"
              element={
                <ProtectedRoute allowedRoles={["Admin", "Manager"]}>
                  <PlaceholderPage />
                </ProtectedRoute>
              }
            />

            {/* Permissions */}
            <Route
              path="permissions"
              element={
                <ProtectedRoute allowedRoles={["Admin"]}>
                  <PlaceholderPage />
                </ProtectedRoute>
              }
            />

            {/* Salary */}
            <Route
              path="salary/calculate"
              element={
                <ProtectedRoute allowedRoles={["Admin", "Manager"]}>
                  <SalaryCalculation />
                </ProtectedRoute>
              }
            />
            <Route
              path="salary/view"
              element={
                <ProtectedRoute allowedRoles={["Employee", "Manager"]}>
                  <SalaryView />
                </ProtectedRoute>
              }
            />
            <Route
              path="salary/export"
              element={
                <ProtectedRoute allowedRoles={["Admin", "Manager"]}>
                  <PlaceholderPage />
                </ProtectedRoute>
              }
            />

            {/* Rewards */}
            <Route
              path="rewards"
              element={
                <ProtectedRoute allowedRoles={["Manager"]}>
                  <PlaceholderPage />
                </ProtectedRoute>
              }
            />

            {/* Recruitment */}
            <Route
              path="recruitment/jobs"
              element={
                <ProtectedRoute>
                  <PlaceholderPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="recruitment/jobs/create"
              element={
                <ProtectedRoute allowedRoles={["Manager", "Admin"]}>
                  <PlaceholderPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="recruitment/jobs/edit/:id"
              element={
                <ProtectedRoute allowedRoles={["Manager", "Admin"]}>
                  <PlaceholderPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="recruitment/jobs/:id"
              element={
                <ProtectedRoute>
                  <PlaceholderPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="recruitment/jobs/:id/apply"
              element={
                <ProtectedRoute allowedRoles={["Candidate"]}>
                  <PlaceholderPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="recruitment/my-applications"
              element={
                <ProtectedRoute allowedRoles={["Candidate"]}>
                  <PlaceholderPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="recruitment/management"
              element={
                <ProtectedRoute allowedRoles={["Manager", "Admin"]}>
                  <PlaceholderPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="recruitment/applications/:id"
              element={
                <ProtectedRoute allowedRoles={["Manager", "Admin"]}>
                  <PlaceholderPage />
                </ProtectedRoute>
              }
            />

            {/* Reports */}
            <Route
              path="reports"
              element={
                <ProtectedRoute allowedRoles={["Admin", "Manager"]}>
                  <PlaceholderPage />
                </ProtectedRoute>
              }
            />

            {/* Nested 404 */}
            <Route path="*" element={<PlaceholderPage />} />
          </Route>

          {/* Top-level 404 */}
          <Route path="*" element={<PlaceholderPage />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
