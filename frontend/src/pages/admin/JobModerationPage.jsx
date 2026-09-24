import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Card, Skeleton, EmptyState } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Briefcase, AlertTriangle, Trash2, XCircle, ExternalLink } from 'lucide-react';

export const JobModerationPage = () => {
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/jobs?limit=50');
      setJobs(res.data.data.items || []);
    } catch (err) {
      console.error('Failed to load jobs for moderation:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleModerate = async (jobId, action) => {
    if (!window.confirm(`Are you sure you want to perform moderation action: ${action}?`)) return;
    try {
      await api.post(`/admin/jobs/${jobId}/moderate`, { action });
      fetchJobs();
    } catch (err) {
      alert(err.response?.data?.message || 'Moderation failed');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          Requisition Moderation
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Review, flag, close, or remove listings violating platform content policies.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No jobs to moderate"
          description="All open listings have been reviewed."
        />
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <Card key={job._id} className="p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-bold text-slate-900">{job.title}</h3>
                    <StatusBadge status={job.status} />
                    <span className="text-xs text-slate-500 font-medium">
                      Company: {job.companyId?.name}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {job.location} • ${job.salary?.min?.toLocaleString()} - ${job.salary?.max?.toLocaleString()} • Posted {new Date(job.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <a href={`/jobs/${job._id}`} target="_blank" rel="noreferrer">
                    <Button variant="outline" size="sm" icon={ExternalLink}>
                      Inspect
                    </Button>
                  </a>
                  {job.status === 'PUBLISHED' && (
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={XCircle}
                      onClick={() => handleModerate(job._id, 'CLOSE')}
                    >
                      Force Close
                    </Button>
                  )}
                  <Button
                    variant="danger"
                    size="sm"
                    icon={Trash2}
                    onClick={() => handleModerate(job._id, 'DELETE')}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
