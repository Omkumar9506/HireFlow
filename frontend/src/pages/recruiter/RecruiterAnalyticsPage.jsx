import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Card, Skeleton } from '../../components/ui/Card';
import { TrendingUp, Users, CheckCircle2, UserCheck, Layers } from 'lucide-react';

export const RecruiterAnalyticsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true);
      try {
        const [jobsRes, intRes] = await Promise.all([
          api.get('/jobs/recruiter/my-jobs'),
          api.get('/interviews'),
        ]);
        setJobs(jobsRes.data.data.items || []);
        setInterviews(intRes.data.data || []);
      } catch (err) {
        console.error('Failed to load recruiter analytics:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const totalApplications = jobs.reduce((sum, j) => sum + (j.applicationCount || 0), 0);
  const totalInterviews = interviews.length;
  const completedInterviews = interviews.filter((i) => i.status === 'COMPLETED').length;
  const strongHires = interviews.filter((i) => i.feedback?.recommendation === 'STRONG_HIRE' || i.feedback?.recommendation === 'HIRE').length;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-1/4" />
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          Recruitment & Pipeline Analytics
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Real-time metrics and funnel conversion velocity across your active requisitions.
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Pipeline Throughput</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{totalApplications}</p>
          <span className="text-[11px] text-slate-400">Total received applications</span>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Interviews Conducted</span>
            <Layers className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{completedInterviews}</p>
          <span className="text-[11px] text-slate-400">Of {totalInterviews} scheduled</span>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Candidate Hire Endorsements</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{strongHires}</p>
          <span className="text-[11px] text-emerald-600 font-semibold">Positive rubric scores</span>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Interview Yield Ratio</span>
            <TrendingUp className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            {totalApplications > 0 ? Math.round((totalInterviews / totalApplications) * 100) : 0}%
          </p>
          <span className="text-[11px] text-slate-400">Screening-to-interview rate</span>
        </Card>
      </div>

      {/* Requisitions Performance Breakdown */}
      <Card className="p-6">
        <h3 className="text-sm font-bold text-slate-900 mb-4">Requisition Pipeline Breakdown</h3>
        <div className="space-y-4">
          {jobs.map((job) => {
            const percentage = totalApplications > 0 ? Math.round(((job.applicationCount || 0) / totalApplications) * 100) : 0;
            return (
              <div key={job._id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800">{job.title}</span>
                  <span className="text-slate-500">
                    <strong className="text-slate-900">{job.applicationCount || 0}</strong> candidates ({percentage}%)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: `${percentage}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};
