import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">🏥 Healthcare Management System</div>

      <div className="navbar-links">
        {user?.role === 'patient' && (
          <>
            <Link to="/dashboard">Log Health</Link>
            <Link to="/summary">Summary</Link>
          </>
        )}
        {user?.role === 'admin' && (
          <Link to="/admin">Admin Dashboard</Link>
        )}
      </div>

      <div className="navbar-user">
        <span>{user?.name} ({user?.role})</span>
        <button onClick={handleLogout} className="btn-logout">Logout</button>
      </div>
    </nav>
  );
}
