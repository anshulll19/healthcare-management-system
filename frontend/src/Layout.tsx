import React from 'react';
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  FileText,
  Activity, 
  Search,
  Bell,
  HelpCircle,
  LogOut,
  Clock
} from 'lucide-react';

export default function Layout({ role }: { role: string | null }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:8000/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Clear all frontend storage
      localStorage.clear();
      sessionStorage.clear();
      
      // Redirecting via window.location strongly clears state-held values in App.tsx
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0e14] text-[#ecedf6] flex font-sans">
      
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 bg-[#10131a] hidden md:flex flex-col">
        <div className="p-6 flex items-center gap-3 border-b border-white/5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#00E5FF] to-[#9D00FF] flex items-center justify-center shadow-[0_0_12px_rgba(0,229,255,0.4)]">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight">Lumina Health</span>
        </div>
        
        <nav className="flex-1 space-y-2 mt-8">
          {(role === 'admin' ? [
            { name: 'Admin Hub', icon: LayoutDashboard, path: '/' },
            { name: 'System Logs', icon: Clock, path: '/logs' },
          ] : [
            { name: 'Patient Hub', icon: LayoutDashboard, path: '/' },
            { name: 'My Records', icon: Users, path: '/patients' },
            { name: 'Reports', icon: FileText, path: '/reports' },
          ]).map((item) => (
            <NavLink 
              key={item.name}
              to={item.path}
              className={({ isActive }) => `w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive 
                  ? 'bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.05)]' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {({ isActive }) => (
                <>
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-[#00E5FF]' : ''}`} />
                  <span className="font-medium">{item.name}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
        
        {/* Log New Vitals Button */}
        <div className="p-4 mb-4">
          <Link to="/log-health" className="w-full py-3 rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#39FF14] text-[#0b0e14] font-bold shadow-[0_0_20px_rgba(0,229,255,0.5)] hover:shadow-[0_0_25px_rgba(0,229,255,0.8)] hover:scale-[1.02] transition-all flex items-center justify-center gap-2">
            <Activity className="w-5 h-5" />
            Log New Vitals
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Subtle Background Grid Element */}
        <div className="absolute inset-0 pointer-events-none" 
             style={{ 
               backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)',
               backgroundSize: '40px 40px' 
             }} 
        />

        {/* Top Header */}
        <header className="h-20 border-b border-white/5 bg-[#0b0e14]/80 backdrop-blur-md flex items-center justify-between px-8 relative z-10">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search patients, doctors, or reports..." 
              className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-[#00E5FF]/50 focus:shadow-[0_0_10px_rgba(0,229,255,0.2)] transition-all"
            />
          </div>
          <div className="flex items-center gap-5">
            <button className="text-gray-400 hover:text-white transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#FF007F] rounded-full shadow-[0_0_8px_rgba(255,0,127,0.6)]"></span>
            </button>
            <button className="text-gray-400 hover:text-white transition-colors">
              <HelpCircle className="w-5 h-5" />
            </button>
            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-500 to-[#FF007F] flex items-center justify-center text-sm font-bold shadow-[0_0_10px_rgba(255,0,127,0.3)] cursor-pointer">
              DA
            </div>
            
            {/* Logout Button */}
            <button 
              onClick={handleLogout} 
              className="flex items-center justify-center w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-[#FF007F] transition-all shadow-sm ml-2"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Outlet for nested routes */}
        <div className="p-8 relative z-10 flex-1 overflow-y-auto w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
