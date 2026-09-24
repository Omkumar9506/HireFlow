import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../store/AuthContext';
import { Card, Skeleton } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import {
  FileCheck,
  Calendar,
  Sparkles,
  Bookmark,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Clock,
  Briefcase,
} from 'lucide-react';

export const CandidateDashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [applications, setApplications] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      try {
        const [profRes, appsRes, intRes, jobsRes] = await Promise.all([
          api.get('/candidates/me'),
          api.get('/candidates/applications'),
          api.get('/interviews?status=SCHEDULED'),
          api.get('/jobs?limit=3'),
        ]);

        setProfile(profRes.data.data);
        setApplications(appsRes.data.data || []);
        setInterviews(intRes.data.data || []);
        setRecommendedJobs(jobsRes.data.data.items || []);
      } catch (err) {
        console.error('Error loading dashboard:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // Compute profile completion score
  const calculateCompletion = () => {
    if (!profile) return 0;
    let score = 20; // user registered
    if (profile.headline) score += 15;
    if (profile.bio) score += 15;
    if (profile.skills && profile.skills.length > 0) score += 20;
    if (profile.resumeId) score += 20;
    if (profile.experience && profile.experience.length > 0) score += 10;
    return Math.min(100, score);
  };

  const shortlistedCount = applications.filter((a) =>
    ['SHORTLISTED', 'INTERVIEW', 'SELECTED', 'OFFERED', 'HIRED'].includes(a.status)
  ).length;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-1/4" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const completionScore = calculateCompletion();

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Welcome back, {user?.name}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track your pipeline status, upcoming interviews, and profile visibility.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/jobs">
            <Button variant="primary" size="sm" icon={Briefcase}>
              Explore Jobs
            </Button>
          </Link>
          <Link to="/candidate/resume">
            <Button variant="outline" size="sm">
              Manage Resume
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Row (Real Backend Data) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Total Applications</span>
            <FileCheck className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{applications.length}</p>
          <span className="text-[11px] text-slate-400">All submitted requisitions</span>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Shortlisted</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{shortlistedCount}</p>
          <span className="text-[11px] text-emerald-600 font-medium">Advanced in pipeline</span>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Upcoming Interviews</span>
            <Calendar className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{interviews.length}</p>
          <span className="text-[11px] text-amber-600 font-medium">Scheduled conversations</span>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Profile Strength</span>
            <Sparkles className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{completionScore}%</p>
          <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className={`h-full rounded-full ${
                completionScore >= 80 ? 'bg-emerald-500' : 'bg-blue-600'
              }`}
              style={{ width: `${completionScore}%` }}
            />
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recent Applications Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Recent Applications</h2>
            <Link to="/candidate/applications" className="text-xs font-semibold text-blue-600 hover:underline">
              View all ({applications.length}) →
            </Link>
          </div>

          <Card className="p-0 overflow-hidden">
            {applications.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500">
                You haven&apos;t applied for any positions yet.{' '}
                <Link to="/jobs" className="text-blue-600 font-semibold underline">
                  Discover jobs
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4 font-semibold">Position & Company</th>
                      <th className="py-3 px-4 font-semibold">Applied Date</th>
                      <th className="py-3 px-4 font-semibold">Match</th>
                      <th className="py-3 px-4 font-semibold">Pipeline Stage</th>
                      <th className="py-3 px-4 text-right font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {applications.slice(0, 5).map((app) => (
                      <tr key={app._id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 px-4 font-medium text-slate-900">
                          <Link to={`/candidate/applications/${app._id}`} className="hover:text-blue-600">
                            {app.jobId?.title || 'Job Listing'}
                          </Link>
                          <p className="text-[11px] text-slate-500">{app.jobId?.companyId?.name}</p>
                        </td>
                        <td className="py-3 px-4 text-slate-500">
                          {new Date(app.appliedAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-blue-600">
                            {app.matchScore}%
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <StatusBadge status={app.status} />
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Link to={`/candidate/applications/${app._id}`}>
                            <Button variant="ghost" size="sm">
                              Details
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Upcoming Interviews & Recommended */}
        <div className="space-y-6">
          {/* Upcoming Interviews */}
          <Card>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Scheduled Interviews
              </h3>
              <Link to="/candidate/interviews" className="text-xs text-blue-600 font-semibold hover:underline">
                View ({interviews.length})
              </Link>
            </div>

            <div className="mt-4 space-y-3">
              {interviews.length === 0 ? (
                <p className="text-xs text-slate-500 py-3 text-center">
                  No upcoming interviews scheduled
                </p>
              ) : (
                interviews.map((intv) => (
                  <div key={intv._id} className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">
                        {intv.applicationId?.jobId?.title || 'Technical Interview'}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                        {intv.type}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-600">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{new Date(intv.scheduledAt).toLocaleString()}</span>
                    </div>
                    {intv.meetingLink && (
                      <a
                        href={intv.meetingLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-block text-xs font-semibold text-blue-600 hover:underline"
                      >
                        Join Virtual Meeting Room →
                      </a>
                    )}
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Recommended Jobs */}
          <Card>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
              Open Positions For You
            </h3>
            <div className="space-y-3">
              {recommendedJobs.map((j) => (
                <div key={j._id} className="p-3 rounded-lg border border-slate-100 hover:border-slate-300 transition-colors">
                  <Link to={`/jobs/${j._id}`} className="text-xs font-bold text-slate-900 hover:text-blue-600 block">
                    {j.title}
                  </Link>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {j.companyId?.name} • ${j.salary?.min?.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
