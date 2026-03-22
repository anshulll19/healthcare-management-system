import { useState, useEffect } from 'react';

export default function HealthEntryForm() {
  const [formData, setFormData] = useState({
    weight: '', height: '', blood_pressure: '', blood_sugar: ''
  });
  const [records, setRecords] = useState([]);

  const fetchRecords = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/health/records');
      const data = await response.json();
      // Important: Your Flask backend returns a list, so we handle both cases
      setRecords(Array.isArray(data) ? data : data.records || []);
    } catch (error) {
      console.error('Error fetching records:', error);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://127.0.0.1:5000/api/health/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        alert('Health data logged successfully!');
        setFormData({ weight: '', height: '', blood_pressure: '', blood_sugar: '' });
        fetchRecords();
      }
    } catch (error) {
      alert('Failed to connect to the server.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        const response = await fetch(`http://127.0.0.1:5000/api/health/records/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          alert('Record deleted!');
          fetchRecords();
        }
      } catch (error) {
        alert('Error deleting record');
      }
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '20px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h2>Log Health Data</h2>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '30px' }}>
        <input type="number" name="weight" placeholder="Weight (kg)" value={formData.weight} onChange={handleChange} required style={{ padding: '8px' }} />
        <input type="number" name="height" placeholder="Height (cm)" value={formData.height} onChange={handleChange} required style={{ padding: '8px' }} />
        <input type="text" name="blood_pressure" placeholder="BP (e.g. 120/80)" value={formData.blood_pressure} onChange={handleChange} style={{ padding: '8px' }} />
        <input type="number" name="blood_sugar" placeholder="Sugar (mg/dL)" value={formData.blood_sugar} onChange={handleChange} style={{ padding: '8px' }} />
        <button type="submit" style={{ gridColumn: 'span 2', padding: '10px', background: '#007BFF', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Save Health Entry
        </button>
      </form>

      <hr />

      <h3>Past Records (Aaniya's Module)</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
        <thead>
          <tr style={{ background: '#f4f4f4', textAlign: 'left' }}>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Date</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Weight</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>BP</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {records.length > 0 ? records.map((r) => (
            <tr key={r.id}>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>{new Date(r.entry_date).toLocaleDateString()}</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>{r.weight} kg</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>{r.blood_pressure || 'N/A'}</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                <button onClick={() => handleDelete(r.id)} style={{ padding: '5px 10px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                  Delete
                </button>
              </td>
            </tr>
          )) : (
            <tr><td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>No records found.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}