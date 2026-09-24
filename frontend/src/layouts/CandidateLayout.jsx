import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { WordmarkLogo } from '../components/ui/WordmarkLogo';
import { NotificationBell } from '../components/common/NotificationBell';
import { useAuth } from '../store/AuthContext';
import {
  LayoutDashboard,
  Search,
  FileText,
  Bookmark,
  Calendar,
  User,
  LogOut,
  FileCheck,
} from 'lucide-react';

export const CandidateLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/candidate/dashboard', icon: LayoutDashboard },
    { label: 'Browse Jobs', path: '/jobs', icon: Search },
    { label: 'Applications', path: '/candidate/applications', icon: FileCheck },
    { label: 'Saved Jobs', path: '/candidate/saved-jobs', icon: Bookmark },
    { label: 'Interviews', path: '/candidate/interviews', icon: Calendar },
    { label: 'My Resume', path: '/candidate/resume', icon: FileText },
    { label: 'Profile', path: '/candidate/profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <WordmarkLogo to="/candidate/dashboard" />
            <span className="hidden sm:inline-block text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
              Candidate Workspace
            </span>
          </div>

          <div className="flex items-center gap-3">
            <NotificationBell />
            <div className="h-6 w-px bg-slate-200" />
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'C'}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-semibold text-slate-900 leading-tight">
                  {user?.name || 'Candidate'}
                </p>
                <p className="text-[11px] text-slate-500">{user?.email}</p>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Secondary Sub-Navbar for Navigation Tabs */}
        <div className="border-t border-slate-100 bg-white">
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
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
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
