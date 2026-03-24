import React, { useState, useEffect } from 'react';
import { Users, Trash2, Activity, UserCog } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      const statsRes = await fetch(`http://localhost:8000/api/admin/stats`, { credentials: 'include' });
      if (statsRes.ok) setStats(await statsRes.json());
      
      const usersRes = await fetch(`http://localhost:8000/api/admin/users`, { credentials: 'include' });
      if (usersRes.ok) setUsers(await usersRes.json());
      
      const logsRes = await fetch(`http://localhost:8000/api/admin/logs`, { credentials: 'include' });
      if (logsRes.ok) setLogs(await logsRes.json());
    } catch (err: any) {
      if (err.message === 'Failed to fetch') {
         setError('Server not reachable');
      } else {
         setError(err.message || 'Error fetching admin data');
      }
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const deleteUser = async (id: number) => {
    if (!window.confirm("Delete this user?")) return;
    try {
      const res = await fetch(`http://localhost:8000/api/admin/users/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!res.ok) throw new Error("Failed to delete user");
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard.</h1>
        <p className="text-gray-400">Manage user accounts and view system logs dynamically.</p>
      </div>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard icon={<Users className="text-[#00E5FF]" />} label="Total Users" value={stats?.total_users ?? "N/A"} bg="bg-[#00E5FF]/10" />
        <StatCard icon={<UserCog className="text-[#9D00FF]" />} label="Total Patients" value={stats?.total_patients ?? "N/A"} bg="bg-[#9D00FF]/10" />
        <StatCard icon={<Activity className="text-green-400" />} label="Health Records" value={stats?.total_health_records ?? "N/A"} bg="bg-green-400/10" />
        <StatCard icon={<Users className="text-yellow-400" />} label="Active Sessions" value={stats?.active_sessions ?? "N/A"} bg="bg-yellow-400/10" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
          <h2 className="text-xl font-bold mb-4">User Management</h2>
          <div className="space-y-4">
            {users.length === 0 ? <p className="text-gray-400">No users found.</p> : users.map(u => (
              <div key={u.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                <div>
                  <p className="font-semibold">{u.name}</p>
                  <p className="text-xs text-gray-400">{u.email} • {u.role}</p>
                </div>
                {u.role !== 'admin' && (
                  <button onClick={() => deleteUser(u.id)} className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20">
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
          <h2 className="text-xl font-bold mb-4">System Activity logs</h2>
          <div className="space-y-4 max-h-[400px] overflow-y-auto">
             {logs.length === 0 ? <p className="text-gray-400">No logs found.</p> : logs.map(l => (
              <div key={l.id} className="p-3 border-l-2 border-[#00E5FF] bg-[#10131a] mb-2 rounded-r-lg">
                <p className="text-sm font-bold text-[#00E5FF]">{l.action}</p>
                <div className="flex justify-between mt-1 opacity-60 text-xs">
                  <span>User ID: {l.user_id}</span>
                  <span>{new Date(l.created_at).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, bg }: { icon: any, label: string, value: string | number, bg: string }) {
  return (
    <div className="bg-white/5 border border-white/10 backdrop-blur-xl p-6 rounded-2xl flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${bg}`}>{icon}</div>
      <div>
        <p className="text-gray-400 text-sm">{label}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
      </div>
    </div>
  );
}
