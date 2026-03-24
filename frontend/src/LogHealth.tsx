import React, { useState } from 'react';

export default function LogHealth() {
  const [formData, setFormData] = useState({
    weight: '',
    height: '',
    blood_pressure: '',
    blood_sugar: ''
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const res = await fetch('http://localhost:8000/api/health/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to log vitals');
      
      setMessage('Data Saved Successfully');
      setFormData({ weight: '', height: '', blood_pressure: '', blood_sugar: '' });
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Log New Vitals</h1>
        <p className="text-gray-400">Enter patient medical logging data.</p>
      </div>

      <div className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10 w-full">
        {message && <div className="mb-6 px-4 py-3 bg-[#39FF14]/20 border border-[#39FF14]/50 rounded-xl text-[#39FF14]">{message}</div>}
        {error && <div className="mb-6 px-4 py-3 bg-[#FF007F]/20 border border-[#FF007F]/50 rounded-xl text-[#FF007F]">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Weight (kg)</label>
            <input 
              type="number" 
              step="0.01"
              value={formData.weight}
              onChange={(e) => setFormData({...formData, weight: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00E5FF]/50 transition-colors"
              placeholder="e.g. 70.5"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Height (cm)</label>
            <input 
              type="number" 
              step="0.01"
              value={formData.height}
              onChange={(e) => setFormData({...formData, height: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00E5FF]/50 transition-colors"
              placeholder="e.g. 175"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Blood Pressure (SYS/DIA)</label>
            <input 
              type="text" 
              value={formData.blood_pressure}
              onChange={(e) => setFormData({...formData, blood_pressure: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00E5FF]/50 transition-colors"
              placeholder="e.g. 120/80"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Blood Sugar (mg/dL)</label>
            <input 
              type="number" 
              value={formData.blood_sugar}
              onChange={(e) => setFormData({...formData, blood_sugar: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00E5FF]/50 transition-colors"
              placeholder="e.g. 95"
            />
          </div>
          <button 
            type="submit"
            className="w-full py-4 mt-4 rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#39FF14] text-[#0b0e14] font-bold shadow-[0_0_20px_rgba(0,229,255,0.4)] hover:shadow-[0_0_25px_rgba(0,229,255,0.7)] transition-all"
          >
            Save Vitals
          </button>
        </form>
      </div>
    </div>
  );
}
