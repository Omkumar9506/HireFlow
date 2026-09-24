import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { WordmarkLogo } from '../components/ui/WordmarkLogo';
import { useAuth } from '../store/AuthContext';
import {
  ShieldCheck,
  Users,
  Building,
  Briefcase,
  FileSpreadsheet,
  Settings,
  LogOut,
  LayoutDashboard,
} from 'lucide-react';

export const AdminLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Overview', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'User Governance', path: '/admin/users', icon: Users },
    { label: 'Company Verification', path: '/admin/companies', icon: Building },
    { label: 'Job Moderation', path: '/admin/jobs', icon: Briefcase },
    { label: 'Audit Trail', path: '/admin/audit-logs', icon: FileSpreadsheet },
    { label: 'System Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-slate-900 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/admin/dashboard" className="flex items-center gap-2 font-bold tracking-tight text-white">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500 text-white font-black text-sm">
                HF
              </span>
              <span className="text-xl font-extrabold text-white">
                HireFlow <span className="text-blue-400">Governance</span>
              </span>
            </Link>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded bg-blue-900/60 text-blue-200 border border-blue-700/60">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              Platform Administrator
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-800 text-blue-300 flex items-center justify-center font-bold text-xs border border-slate-700">
                A
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-semibold text-white leading-tight">
                  {user?.name || 'Administrator'}
                </p>
                <p className="text-[11px] text-slate-400">{user?.email}</p>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Secondary Sub-Navbar for Navigation Tabs */}
        <div className="border-t border-slate-800 bg-slate-900/90 backdrop-blur-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1 sm:gap-2 overflow-x-auto py-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white font-semibold shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
};
