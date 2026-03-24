import React, { useState, useEffect } from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Reusable StatCard with Glassmorphism
const StatCard = ({ title, value, trend, trendUp, children }: { 
  title: string, value: string | number, trend: string, trendUp: boolean, children?: React.ReactNode 
}) => (
  <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 flex flex-col justify-between">
    <div>
      <h3 className="text-gray-400 text-sm font-medium mb-2">{title}</h3>
      <div className="flex items-end gap-3 mb-4">
        <span className="text-3xl font-bold text-white">{value}</span>
        {trend && (
          <span className={`text-sm mb-1 ${trendUp ? 'text-green-400' : 'text-red-400'}`}>
            {trendUp ? '+' : ''}{trend}
          </span>
        )}
      </div>
    </div>
    {children}
  </div>
);

export default function Dashboard() {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/summary`, {
          credentials: 'include'
        });
        
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || 'Error fetching backend data');
        }
        
        const data = await res.json();
        setSummary(data.summary || data); 
      } catch (err: any) {
        if (err.message === 'Failed to fetch') {
          setError('Server not reachable');
        } else {
          setError(err.message || 'Failed to load details');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  // Safe fallback values directly from real analytics
  const totalRecords = summary?.total_records || 0;
  const recentWeight = summary?.latest_entry?.weight || "0";
  const avgWeight = summary?.avg_weight_kg || "0";
  const avgSugar = summary?.avg_blood_sugar || "0";

  const chartData = {
    labels: summary?.weight_trend?.map((t: any) => new Date(t.date).toLocaleDateString()) || [],
    datasets: [
      {
        label: 'Weight Trend (kg)',
        data: summary?.weight_trend?.map((t: any) => t.weight) || [],
        borderColor: '#00E5FF',
        backgroundColor: 'rgba(0, 229, 255, 0.5)',
        tension: 0.4
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { labels: { color: '#fff' } } },
    scales: {
      x: { ticks: { color: '#aaa' }, grid: { color: 'rgba(255, 255, 255, 0.05)' } },
      y: { ticks: { color: '#aaa' }, grid: { color: 'rgba(255, 255, 255, 0.05)' } }
    }
  };

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome back.</h1>
        <p className="text-gray-400">Here's what's happening at your facility today.</p>
      </div>

      {loading ? (
        <p className="text-gray-400">Loading data...</p>
      ) : error ? (
        <p className="text-red-400">{error}</p>
      ) : (
        <>
          {/* Metrics Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard 
              title="Total Records" 
              value={totalRecords} 
              trend="" 
              trendUp={true} 
            />
            <StatCard 
              title="Latest Weight (kg)" 
              value={recentWeight} 
              trend="" 
              trendUp={false} 
            />
            <StatCard 
              title="Avg Weight (kg)" 
              value={avgWeight} 
              trend="" 
              trendUp={true} 
            />
            <StatCard 
              title="Avg Blood Sugar" 
              value={avgSugar} 
              trend="" 
              trendUp={true}
            />
          </div>

          {/* Flow & Leaderboard Grids */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            
            <div className="xl:col-span-3 space-y-6">
              
              {/* Actual medical Chart plot replacing the dummy graph */}
              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 w-full min-h-[350px] flex flex-col">
                 <h3 className="text-lg font-semibold text-white mb-2 self-start">Patient Weight Analytics</h3>
                 <p className="text-gray-500 text-sm mb-6 self-start">Historical trends across recent active entries.</p>
                 <div className="w-full flex-1 relative mt-2 min-h-[250px]">
                    {summary?.weight_trend && summary.weight_trend.length > 0 ? (
                      <Line data={chartData} options={chartOptions} />
                    ) : (
                      <p className="text-gray-400 text-sm">No trend data available.</p>
                    )}
                 </div>
              </div>
            </div>

          </div>
        </>
      )}
    </div>
  );
}
