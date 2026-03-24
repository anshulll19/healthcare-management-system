import React, { useState, useEffect } from 'react';

export default function Logs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/admin/logs`, {
          credentials: 'include'
        });
        if (!res.ok) throw new Error('Failed to fetch logs');
        const data = await res.json();
        setLogs(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setLogs([]);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Activity Logs</h1>
        <p className="text-gray-400">System actions and history</p>
      </div>

      <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 w-full">
        {loading ? (
          <p className="text-gray-400">Loading logs...</p>
        ) : logs.length > 0 ? (
          <ul className="space-y-4 text-gray-300">
            {logs.map((log, i) => (
              <li key={i} className="flex justify-between border-b border-white/5 pb-4 last:border-0 last:pb-0">
                <span className="text-white">{log.action || "Unknown action"}</span>
                <span className="text-sm text-gray-400">{new Date(log.created_at).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-400">No logs found.</p>
        )}
      </div>
    </div>
  );
}
