import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import HealthEntryForm from './components/HealthEntryForm';
import HealthSummary from './components/HealthSummary';
import AdminDashboard from './components/AdminDashboard';
import Navbar from './components/Navbar';
import './App.css';

// Redirects to login if not authenticated; to role-home if adminOnly fails
function PrivateRoute({ children, adminOnly = false }) {
  const { user } = useAuth();
  if (user === undefined) return <div className="loading">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
}

// Redirects authenticated users away from login/register
function PublicRoute({ children }) {
  const { user } = useAuth();
  if (user === undefined) return <div className="loading">Loading…</div>;
  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  return children;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <>
      {user && <Navbar />}
      <Routes>
        <Route path="/"          element={<Navigate to="/login" replace />} />
        <Route path="/login"     element={<PublicRoute><LoginForm /></PublicRoute>} />
        <Route path="/register"  element={<PublicRoute><RegisterForm /></PublicRoute>} />
        <Route path="/dashboard" element={<PrivateRoute><HealthEntryForm /></PrivateRoute>} />
        <Route path="/summary"   element={<PrivateRoute><HealthSummary /></PrivateRoute>} />
        <Route path="/admin"     element={<PrivateRoute adminOnly><AdminDashboard /></PrivateRoute>} />
        <Route path="*"          element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}