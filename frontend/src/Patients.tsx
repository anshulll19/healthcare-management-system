import React, { useState, useEffect } from 'react';

export default function Patients() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/records`, {
          credentials: 'include'
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || 'Error fetching data');
        }
        const data = await res.json();
        setRecords(Array.isArray(data) ? data : []);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Network error');
        setRecords([]);
      } finally {
        setLoading(false);
      }
    };
    fetchRecords();
    const interval = setInterval(fetchRecords, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Patients Records</h1>
        <p className="text-gray-400">View logged health records for your account.</p>
      </div>

      <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 w-full shadow-lg">
        {loading ? (
          <p className="text-gray-400">Loading records...</p>
        ) : error ? (
          <p className="text-red-400">{error}</p>
        ) : records.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="text-xs text-gray-400 uppercase bg-white/5 border-b border-white/10">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Weight (kg)</th>
                  <th className="px-4 py-3">Height (cm)</th>
                  <th className="px-4 py-3">Blood Pressure</th>
                  <th className="px-4 py-3">Blood Sugar</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r, i) => (
                  <tr key={i} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3">{new Date(r.created_at).toLocaleString()}</td>
                    <td className="px-4 py-3 text-white font-medium">{r.weight || '—'}</td>
                    <td className="px-4 py-3 text-white font-medium">{r.height || '—'}</td>
                    <td className="px-4 py-3 text-white font-medium">{r.blood_pressure || '—'}</td>
                    <td className="px-4 py-3 text-white font-medium">{r.blood_sugar || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-400">No patient records available.</p>
        )}
      </div>
    </div>
  );
}
