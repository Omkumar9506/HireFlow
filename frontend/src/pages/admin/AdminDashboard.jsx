import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Card, Skeleton } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import {
  Users,
  Building,
  Briefcase,
  FileCheck,
  Calendar,
  CheckCircle2,
  ShieldCheck,
  TrendingUp,
  FileSpreadsheet,
} from 'lucide-react';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        const res = await api.get('/admin/stats');
        setStats(res.data.data);
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-1/3" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const { overview = {}, funnel = {} } = stats || {};

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Platform Governance & Global Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real MongoDB aggregation telemetry across users, companies, jobs, and recruitment funnels.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/admin/companies">
            <Button variant="primary" size="sm" icon={Building}>
              Verify Companies
            </Button>
          </Link>
          <Link to="/admin/audit-logs">
            <Button variant="outline" size="sm" icon={FileSpreadsheet}>
              Audit Trail
            </Button>
          </Link>
        </div>
      </div>

      {/* Global Metrics Row (Real Data from MongoDB) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Total Accounts</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{overview.totalUsers || 0}</p>
          <span className="text-[11px] text-slate-400">
            {overview.candidatesCount} Candidates • {overview.recruitersCount} Recruiters
          </span>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Registered Companies</span>
            <Building className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{overview.companiesCount || 0}</p>
          <span className="text-[11px] text-slate-400">Employers on platform</span>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Published Requisitions</span>
            <Briefcase className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{overview.activeJobs || 0}</p>
          <span className="text-[11px] text-emerald-600 font-medium">Accepting applications</span>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Total Applications</span>
            <FileCheck className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{overview.totalApplications || 0}</p>
          <span className="text-[11px] text-slate-400">Pipeline submissions</span>
        </Card>
      </div>

      {/* Recruitment Funnel Breakdown */}
      <Card className="p-6">
        <h3 className="text-sm font-bold text-slate-900 mb-6 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-blue-600" /> Platform-Wide ATS Funnel Conversion
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {[
            { key: 'APPLIED', label: 'Applied', color: 'bg-blue-600' },
            { key: 'SCREENING', label: 'Screening', color: 'bg-purple-600' },
            { key: 'SHORTLISTED', label: 'Shortlisted', color: 'bg-cyan-600' },
            { key: 'INTERVIEW', label: 'Interview', color: 'bg-amber-600' },
            { key: 'SELECTED', label: 'Selected', color: 'bg-indigo-600' },
            { key: 'OFFERED', label: 'Offered', color: 'bg-teal-600' },
            { key: 'HIRED', label: 'Hired', color: 'bg-emerald-600' },
          ].map((stage) => {
            const count = funnel[stage.key] || 0;
            return (
              <div key={stage.key} className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  {stage.label}
                </span>
                <span className="text-xl font-extrabold text-slate-900">{count}</span>
                <div className="w-full bg-slate-200 h-1.5 rounded-full mt-3 overflow-hidden">
                  <div
                    className={`h-full ${stage.color} rounded-full`}
                    style={{
                      width: `${overview.totalApplications ? Math.max(10, Math.round((count / overview.totalApplications) * 100)) : 0}%`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};
