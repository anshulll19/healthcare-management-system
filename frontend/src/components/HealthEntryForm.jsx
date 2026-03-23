import { useState, useEffect } from 'react';

const BP_REGEX = /^\d{2,3}\/\d{2,3}$/;

export default function HealthEntryForm() {
  const [formData, setFormData] = useState({
    weight: '', height: '', blood_pressure: '', blood_sugar: ''
  });
  const [records,  setRecords]  = useState([]);
  const [message,  setMessage]  = useState({ text: '', type: '' });
  const [loading,  setLoading]  = useState(false);

  const showMsg = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 4000);
  };

  const fetchRecords = async () => {
    try {
      const r = await fetch('/api/health/records', { credentials: 'include' });
      if (!r.ok) {
        showMsg('Could not fetch records. Please log in again.', 'error');
        return;
      }
      const data = await r.json();
      setRecords(Array.isArray(data) ? data : []);
    } catch {
      showMsg('Network error while fetching records.', 'error');
    }
  };

  useEffect(() => { fetchRecords(); }, []);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side BP format validation
    if (formData.blood_pressure && !BP_REGEX.test(formData.blood_pressure)) {
      showMsg("Blood pressure must be in 'systolic/diastolic' format, e.g. 120/80.", 'error');
      return;
    }

    setLoading(true);
    try {
      const r = await fetch('/api/health/log', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await r.json();

      if (r.ok) {
        showMsg('Data Saved Successfully!', 'success');
        setFormData({ weight: '', height: '', blood_pressure: '', blood_sugar: '' });
        fetchRecords();
      } else {
        showMsg(data.error || 'Failed to save data.', 'error');
      }
    } catch {
      showMsg('Network error. Is the server running?', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this record?')) return;
    try {
      const r = await fetch(`/api/health/records/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (r.ok) {
        showMsg('Record deleted.', 'success');
        fetchRecords();
      } else {
        const data = await r.json();
        showMsg(data.error || 'Could not delete record.', 'error');
      }
    } catch {
      showMsg('Network error while deleting.', 'error');
    }
  };

  return (
    <div className="page-content">
      <h2>Log Health Data</h2>

      <form onSubmit={handleSubmit} className="health-form">
        <div className="form-group">
          <label>Weight (kg)</label>
          <input type="number" name="weight" min="1" max="500" step="0.01"
            placeholder="e.g. 68.5" value={formData.weight} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Height (cm)</label>
          <input type="number" name="height" min="50" max="300" step="0.1"
            placeholder="e.g. 172" value={formData.height} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Blood Pressure <span className="hint">(e.g. 120/80)</span></label>
          <input type="text" name="blood_pressure" pattern="^\d{2,3}\/\d{2,3}$"
            placeholder="120/80" value={formData.blood_pressure} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Blood Sugar (mg/dL)</label>
          <input type="number" name="blood_sugar" min="0" max="1000"
            placeholder="e.g. 95" value={formData.blood_sugar} onChange={handleChange} />
        </div>

        {message.text && (
          <p className={message.type === 'success' ? 'msg-success' : 'msg-error'}>
            {message.text}
          </p>
        )}

        <button type="submit" className="btn-primary" disabled={loading} style={{ gridColumn: 'span 2' }}>
          {loading ? 'Saving…' : 'Save Health Entry'}
        </button>
      </form>

      <hr className="divider" />
      <h3>Past Records</h3>

      <table className="data-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Weight (kg)</th>
            <th>Height (cm)</th>
            <th>Blood Pressure</th>
            <th>Sugar (mg/dL)</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {records.length > 0 ? records.map((r) => (
            <tr key={r.id}>
              <td>{new Date(r.entry_date).toLocaleDateString()}</td>
              <td>{r.weight ?? '—'}</td>
              <td>{r.height ?? '—'}</td>
              <td>{r.blood_pressure || '—'}</td>
              <td>{r.blood_sugar ?? '—'}</td>
              <td>
                <button
                  onClick={() => handleDelete(r.id)}
                  className="btn-danger"
                >
                  Delete
                </button>
              </td>
            </tr>
          )) : (
            <tr><td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>No records found.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}