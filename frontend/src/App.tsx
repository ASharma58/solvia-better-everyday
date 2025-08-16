import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import MoodTracker from "./pages/MoodTracker";
import Journal from "./pages/Journal";
import CBTChat from "./pages/CBTChat";
import Resources from "./pages/Resources";
import Profile from "./pages/Profile";
import Mindfulness from "./pages/Mindfulness";
import Signup from "./pages/SignUp";
import Login from "./pages/Login";
import Layout from "./components/Layout";

import AdminLayout from "./pages/AdminLayout";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import { AdminProvider, useAdmin } from "./contexts/AdminContexts";

function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAdmin();
  return isAuthenticated ? <>{children}</> : <Navigate to="/admin/login" replace />;
}

function App() {
  return (
    <Router>
      <AdminProvider>
        <div className="font-inter bg-gray-50 min-h-screen">
          <Routes>
            {/* Public */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/app" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="mood" element={<MoodTracker />} />
              <Route path="journal" element={<Journal />} />
              <Route path="cbt" element={<CBTChat />} />
              <Route path="mindfulness" element={<Mindfulness />} />
              <Route path="resources" element={<Resources />} />
              <Route path="profile" element={<Profile />} />
            </Route>

            {/* Admin */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin"
              element={
                <RequireAdmin>
                  <AdminLayout />
                </RequireAdmin>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </AdminProvider>
    </Router>
  );
}

export default App;
