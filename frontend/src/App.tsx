import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './Layout';
import Dashboard from './Dashboard';
import Auth from './Auth';
import Patients from './Patients';
import Reports from './Reports';
import Logs from './Logs';
import LogHealth from './LogHealth';
import AdminDashboard from './AdminDashboard';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const userRole = localStorage.getItem('user_role');
    if (userRole) {
      setIsAuthenticated(true);
      setRole(userRole);
    }
  }, []);

  return isAuthenticated ? (
    <Routes>
      <Route path="/" element={<Layout role={role} />}>
        <Route index element={role === 'admin' ? <AdminDashboard /> : <Dashboard />} />
        {role === 'patient' && (
          <>
            <Route path="patients" element={<Patients />} />
            <Route path="reports" element={<Reports />} />
            <Route path="log-health" element={<LogHealth />} />
          </>
        )}
        {role === 'admin' && (
          <Route path="logs" element={<Logs />} />
        )}
      </Route>
    </Routes>
  ) : (
    <Auth onLogin={(r: string) => { setIsAuthenticated(true); setRole(r); }} />
  );
}

export default App;
