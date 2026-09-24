import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../store/AuthContext';
import { Card, Skeleton } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import {
  Briefcase,
  Users,
  Calendar,
  CheckCircle2,
  TrendingUp,
  PlusCircle,
  Building2,
  ArrowRight,
  Layers,
} from 'lucide-react';

export const RecruiterDashboard = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [company, setCompany] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecruiterData = async () => {
      setIsLoading(true);
      try {
        const [jobsRes, intRes, compRes] = await Promise.all([
          api.get('/jobs/recruiter/my-jobs'),
          api.get('/interviews'),
          api.get('/companies/user/me'),
        ]);

        setJobs(jobsRes.data.data.items || []);
        setInterviews(intRes.data.data || []);
        setCompany(compRes.data.data);
      } catch (err) {
        console.error('Failed to load recruiter dashboard:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecruiterData();
  }, []);

  const activeJobs = jobs.filter((j) => j.status === 'PUBLISHED');
  const totalApplications = jobs.reduce((sum, j) => sum + (j.applicationCount || 0), 0);
  const scheduledInterviews = interviews.filter((i) => i.status === 'SCHEDULED');

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-1/3" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Recruitment Command Center
            </h1>
            {company?.verificationStatus && (
              <StatusBadge status={company.verificationStatus} />
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {company?.name ? `${company.name} • ` : ''}Manage active requisitions, ATS applicant pipelines, and evaluations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/recruiter/jobs/create">
            <Button variant="primary" size="sm" icon={PlusCircle}>
              Post New Requisition
            </Button>
          </Link>
          <Link to="/recruiter/company">
            <Button variant="outline" size="sm" icon={Building2}>
              Company Profile
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Active Requisitions</span>
            <Briefcase className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{activeJobs.length}</p>
          <span className="text-[11px] text-slate-400">Of {jobs.length} total created</span>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Total Candidates In Pipeline</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{totalApplications}</p>
          <span className="text-[11px] text-indigo-600 font-medium">Across all open jobs</span>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Upcoming Interviews</span>
            <Calendar className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{scheduledInterviews.length}</p>
          <span className="text-[11px] text-amber-600 font-medium">Scheduled this week</span>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Company Verification</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-sm font-bold text-slate-900 mt-2 truncate">
            {company?.name || 'Profile Pending'}
          </p>
          <span className="text-[11px] text-emerald-600 font-semibold">
            {company?.verificationStatus === 'APPROVED' ? 'Verified to publish' : 'Pending Review'}
          </span>
        </Card>
      </div>

      {/* Requisitions List & Pipeline Launchers */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Active Job Openings & Pipelines</h2>
            <p className="text-xs text-slate-500 mt-0.5">Click into any requisition to access its Kanban pipeline board.</p>
          </div>
          <Link to="/recruiter/jobs" className="text-xs font-semibold text-blue-600 hover:underline">
            View All ({jobs.length}) →
          </Link>
        </div>

        {jobs.length === 0 ? (
          <Card className="py-12 text-center text-xs text-slate-500">
            You haven&apos;t posted any jobs yet.{' '}
            <Link to="/recruiter/jobs/create" className="text-blue-600 font-semibold underline">
              Create your first job listing
            </Link>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {jobs.slice(0, 6).map((job) => (
              <Card key={job._id} className="p-5 flex flex-col justify-between hover:border-blue-400 transition-all">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <StatusBadge status={job.status} />
                    <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                      {job.applicationCount || 0} Applicants
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 mt-2 line-clamp-1">
                    {job.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {job.location} • {job.workMode}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-1">
                    {(job.skills || []).slice(0, 3).map((s) => (
                      <span key={s} className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-medium">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Created {new Date(job.createdAt).toLocaleDateString()}
                  </span>
                  <Link to={`/recruiter/jobs/${job._id}/applications`}>
                    <Button variant="primary" size="sm" icon={Layers}>
                      Open ATS Pipeline
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
