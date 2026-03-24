import React, { useState, useEffect } from 'react';
import { Download } from 'lucide-react';

const StatCard = ({ title, value }: { title: string, value: string | number }) => (
  <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 flex flex-col justify-between">
    <div>
      <h3 className="text-gray-400 text-sm font-medium mb-2">{title}</h3>
      <div className="flex items-end gap-3 mb-4">
        <span className="text-3xl font-bold text-white">{value}</span>
      </div>
    </div>
  </div>
);

export default function Reports() {
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/health/report`, {
          credentials: 'include'
        });
        if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.message || 'Error fetching report');
        }
        const data = await res.json();
        setReportData(data);
      } catch (err: any) {
        if (err.message === 'Failed to fetch') {
          setError('Server not reachable');
        } else {
          setError(err.message || 'Error retrieving logs');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, []);

  const handleDownload = () => {
    window.location.href = `http://localhost:8000/api/reports/download`;
  };

  return (
    <div className="w-full">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Reports</h1>
          <p className="text-gray-400">Analytics and system insights</p>
        </div>
        <button 
          onClick={handleDownload}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#39FF14] text-[#0b0e14] font-bold shadow-[0_0_15px_rgba(0,229,255,0.4)] hover:shadow-[0_0_20px_rgba(0,229,255,0.7)] transition-all flex items-center gap-2"
        >
          <Download className="w-5 h-5" />
          Download Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard title="Total Health Records" value={loading ? "..." : reportData?.total_records || 0} />
        <StatCard title="System Logs" value={loading ? "..." : reportData?.total_logs || 0} />
        <StatCard title="Health Trend" value={loading ? "..." : reportData?.health_trend || "N/A"} />
      </div>

      <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 w-full mb-8">
        <h3 className="text-lg font-semibold text-white mb-6">Recent Activity Log</h3>
        <div className="space-y-4">
          {reportData?.recent_activity && reportData.recent_activity.length > 0 ? (
            reportData.recent_activity.map((log: any, i: number) => (
              <div key={i} className="flex justify-between items-center border-b border-white/5 pb-4 last:border-0 last:pb-0">
                <span className="text-gray-200">{log.action}</span>
                <span className="text-sm text-gray-500">{new Date(log.created_at).toLocaleString()}</span>
              </div>
            ))
          ) : (
            <p className="text-gray-400 text-sm">No recent activity.</p>
          )}
        </div>
      </div>
    </div>
  );
}
