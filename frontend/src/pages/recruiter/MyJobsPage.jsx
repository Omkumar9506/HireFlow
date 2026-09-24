import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Card, Skeleton, EmptyState } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import {
  Briefcase,
  PlusCircle,
  Layers,
  CheckCircle,
  XCircle,
  Eye,
  DollarSign,
} from 'lucide-react';

export const MyJobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/jobs/recruiter/my-jobs${filter ? `?status=${filter}` : ''}`);
      setJobs(res.data.data.items || []);
    } catch (err) {
      console.error('Failed to load recruiter jobs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [filter]);

  const handlePublish = async (jobId) => {
    try {
      await api.post(`/jobs/${jobId}/publish`);
      fetchJobs();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to publish job requisition');
    }
  };

  const handleClose = async (jobId) => {
    if (!window.confirm('Are you sure you want to close this job requisition? It will no longer accept applications.')) return;
    try {
      await api.post(`/jobs/${jobId}/close`);
      fetchJobs();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to close job');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Requisitions & Open Jobs
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your company listings, review incoming applicants, and publish vacancies.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Status filter */}
          <div className="flex gap-1 p-1 bg-white rounded-lg border border-slate-200">
            {['', 'PUBLISHED', 'DRAFT', 'CLOSED'].map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                  filter === s
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {s ? s.charAt(0) + s.slice(1).toLowerCase() : 'All'}
              </button>
            ))}
          </div>

          <Link to="/recruiter/jobs/create">
            <Button variant="primary" size="sm" icon={PlusCircle}>
              New Requisition
            </Button>
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No job requisitions found"
          description="Create and publish your first job requisition to start receiving candidate applications."
          actionText="Create Job Requisition"
          onAction={() => (window.location.href = '/recruiter/jobs/create')}
        />
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <Card key={job._id} className="p-5 hover:border-slate-300 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-bold text-slate-900">{job.title}</h3>
                    <StatusBadge status={job.status} />
                    <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                      {job.applicationCount || 0} candidates
                    </span>
                  </div>

                  <p className="text-xs text-slate-600">
                    {job.location} • {job.workMode} • {job.employmentType} • {job.openings} opening(s)
                  </p>

                  <div className="flex items-center gap-3 text-xs text-slate-500 pt-1">
                    <span className="font-semibold text-slate-900">
                      ${job.salary?.min?.toLocaleString()} - ${job.salary?.max?.toLocaleString()} /yr
                    </span>
                    <span>•</span>
                    <span>Posted on {new Date(job.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <Link to={`/recruiter/jobs/${job._id}/applications`}>
                    <Button variant="primary" size="sm" icon={Layers}>
                      Open ATS Pipeline
                    </Button>
                  </Link>

                  {job.status === 'DRAFT' && (
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={CheckCircle}
                      onClick={() => handlePublish(job._id)}
                    >
                      Publish
                    </Button>
                  )}

                  {job.status === 'PUBLISHED' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:bg-red-50 hover:text-red-700"
                      icon={XCircle}
                      onClick={() => handleClose(job._id)}
                    >
                      Close
                    </Button>
                  )}

                  <Link to={`/jobs/${job._id}`} target="_blank">
                    <Button variant="outline" size="sm" icon={Eye} title="Preview public page" />
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
