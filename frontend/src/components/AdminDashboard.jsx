import { useState, useEffect } from 'react';

export default function AdminDashboard() {
  const [stats,   setStats]   = useState(null);
  const [users,   setUsers]   = useState([]);
  const [message, setMessage] = useState({ text: '', type: '' });

  const showMsg = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 4000);
  };

  const fetchData = async () => {
    try {
      const [statsRes, usersRes] = await Promise.all([
        fetch('/api/admin/stats', { credentials: 'include' }),
        fetch('/api/admin/users', { credentials: 'include' }),
      ]);
      if (statsRes.ok) setStats(await statsRes.json());
      if (usersRes.ok) setUsers(await usersRes.json());
    } catch {
      showMsg('Failed to load admin data.', 'error');
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async (userId, userName) => {
    if (!window.confirm(`Delete user "${userName}"? This is permanent.`)) return;
    try {
      const r = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await r.json();
      if (r.ok) {
        showMsg(`User "${userName}" deleted.`, 'success');
        fetchData();
      } else {
        showMsg(data.error || 'Could not delete user.', 'error');
      }
    } catch {
      showMsg('Network error.', 'error');
    }
  };

  return (
    <div className="page-content">
      <h2>Admin Dashboard</h2>

      {/* System Stats */}
      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{stats.total_users}</div>
            <div className="stat-label">Total Users</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.total_patients}</div>
            <div className="stat-label">Patients</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.total_health_records}</div>
            <div className="stat-label">Health Records</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.active_sessions}</div>
            <div className="stat-label">Active Sessions</div>
          </div>
        </div>
      )}

      {message.text && (
        <p className={message.type === 'success' ? 'msg-success' : 'msg-error'}>
          {message.text}
        </p>
      )}

      {/* User Management */}
      <h3>User Management</h3>
      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Joined</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.length > 0 ? users.map(u => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td><span className={`badge badge-${u.role}`}>{u.role}</span></td>
              <td>{new Date(u.created_at).toLocaleDateString()}</td>
              <td>
                {u.role !== 'admin' ? (
                  <button onClick={() => handleDelete(u.id, u.name)} className="btn-danger">
                    Delete
                  </button>
                ) : (
                  <span style={{ color: '#999', fontSize: '12px' }}>Protected</span>
                )}
              </td>
            </tr>
          )) : (
            <tr><td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>No users found.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
