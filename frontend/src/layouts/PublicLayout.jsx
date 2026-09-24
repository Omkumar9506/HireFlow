import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { WordmarkLogo } from '../components/ui/WordmarkLogo';
import { Button } from '../components/ui/Button';
import { useAuth } from '../store/AuthContext';
import { ROLES } from '../constants';
import { ArrowRight, Briefcase } from 'lucide-react';

export const PublicLayout = () => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  const getDashboardLink = () => {
    if (!user) return '/login';
    if (user.role === ROLES.ADMIN) return '/admin/dashboard';
    if (user.role === ROLES.RECRUITER) return '/recruiter/dashboard';
    return '/candidate/dashboard';
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xs border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <WordmarkLogo />
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
              <Link
                to="/jobs"
                className={`hover:text-blue-600 transition-colors ${
                  location.pathname === '/jobs' ? 'text-blue-600 font-semibold' : ''
                }`}
              >
                Find Jobs
              </Link>
              <Link
                to="/companies"
                className={`hover:text-blue-600 transition-colors ${
                  location.pathname === '/companies' ? 'text-blue-600 font-semibold' : ''
                }`}
              >
                Companies
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link to={getDashboardLink()}>
                <Button variant="primary" size="sm" icon={ArrowRight}>
                  Open Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register?role=RECRUITER">
                  <Button variant="outline" size="sm" icon={Briefcase}>
                    Post a Job
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <WordmarkLogo size="sm" />
              <p className="mt-3 text-xs text-slate-500 leading-relaxed">
                Enterprise Applicant Tracking System and recruitment pipeline for modern teams.
              </p>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3">
                Candidates
              </h4>
              <ul className="space-y-2 text-xs text-slate-600">
                <li><Link to="/jobs" className="hover:text-blue-600">Browse Jobs</Link></li>
                <li><Link to="/register" className="hover:text-blue-600">Create Candidate Profile</Link></li>
                <li><Link to="/login" className="hover:text-blue-600">Application Status</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3">
                Employers
              </h4>
              <ul className="space-y-2 text-xs text-slate-600">
                <li><Link to="/register?role=RECRUITER" className="hover:text-blue-600">Post Vacancies</Link></li>
                <li><Link to="/login" className="hover:text-blue-600">Recruiter Portal</Link></li>
                <li><Link to="/companies" className="hover:text-blue-600">Company Directory</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3">
                Platform
              </h4>
              <ul className="space-y-2 text-xs text-slate-600">
                <li><a href="/api/docs" target="_blank" rel="noreferrer" className="hover:text-blue-600">Swagger API Docs</a></li>
                <li><span className="text-slate-400">Security & RBAC</span></li>
                <li><span className="text-slate-400">Enterprise SLA</span></li>
              </ul>
            </div>
          </div>
          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
            <p>© {new Date().getFullYear()} HireFlow ATS. Built with MERN Stack.</p>
            <div className="flex gap-4">
              <span>Demo Accounts: admin@hireflow.dev | recruiter@hireflow.dev | candidate@hireflow.dev</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
