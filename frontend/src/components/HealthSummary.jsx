import { useState, useEffect } from 'react';

export default function HealthSummary() {
  const [summary, setSummary] = useState(null);
  const [error,   setError]   = useState('');

  useEffect(() => {
    fetch('/api/health/summary', { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        if (data.summary !== undefined) setSummary(data.summary);
        else setSummary(data);
      })
      .catch(() => setError('Failed to load summary.'));
  }, []);

  if (error) return <div className="page-content"><p className="msg-error">{error}</p></div>;
  if (!summary) return <div className="loading">Loading summary…</div>;

  const isEmpty = Object.keys(summary).length === 0;

  return (
    <div className="page-content">
      <h2>Health Summary</h2>

      {isEmpty ? (
        <p>No health data yet. <a href="/dashboard">Log your first entry!</a></p>
      ) : (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{summary.total_records}</div>
              <div className="stat-label">Total Records</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{summary.avg_weight_kg ?? '—'} <small>kg</small></div>
              <div className="stat-label">Avg Weight</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{summary.avg_blood_sugar ?? '—'} <small>mg/dL</small></div>
              <div className="stat-label">Avg Blood Sugar</div>
            </div>
            {summary.latest_entry && (
              <div className="stat-card">
                <div className="stat-value">{summary.latest_entry.blood_pressure || '—'}</div>
                <div className="stat-label">Latest BP</div>
              </div>
            )}
          </div>

          {summary.weight_trend?.length > 0 && (
            <>
              <h3>Weight Trend</h3>
              <table className="data-table">
                <thead>
                  <tr><th>Date</th><th>Weight (kg)</th></tr>
                </thead>
                <tbody>
                  {summary.weight_trend.map((e, i) => (
                    <tr key={i}>
                      <td>{new Date(e.date).toLocaleDateString()}</td>
                      <td>{e.weight}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </>
      )}
    </div>
  );
}
