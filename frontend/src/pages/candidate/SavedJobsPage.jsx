import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Card, Skeleton, EmptyState } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Bookmark, DollarSign, ArrowRight, Trash2 } from 'lucide-react';

export const SavedJobsPage = () => {
  const [savedJobs, setSavedJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSaved = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/candidates/saved-jobs');
      setSavedJobs(res.data.data || []);
    } catch (err) {
      console.error('Failed to load saved jobs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSaved();
  }, []);

  const handleUnsave = async (jobId) => {
    try {
      await api.delete(`/jobs/${jobId}/save`);
      setSavedJobs((prev) => prev.filter((j) => j._id !== jobId));
    } catch (err) {
      console.warn('Failed to unsave:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          Saved Requisitions
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Jobs you have bookmarked for review and future application.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      ) : savedJobs.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="No saved jobs yet"
          description="When browsing jobs, click the bookmark icon to save roles you are interested in."
          actionText="Browse Available Jobs"
          onAction={() => (window.location.href = '/jobs')}
        />
      ) : (
        <div className="space-y-4">
          {savedJobs.map((job) => (
            <Card key={job._id} className="p-5 hover:border-slate-300 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center font-black text-blue-700 text-base shrink-0">
                    {job.companyId?.name?.charAt(0) || 'C'}
                  </div>
                  <div>
                    <Link
                      to={`/jobs/${job._id}`}
                      className="text-base font-bold text-slate-900 hover:text-blue-600"
                    >
                      {job.title}
                    </Link>
                    <p className="text-xs font-medium text-slate-600 mt-0.5">
                      {job.companyId?.name} • {job.location}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-slate-500">
                      <span className="font-semibold text-slate-900 inline-flex items-center gap-0.5">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-600 -mr-1" />
                        ${job.salary?.min?.toLocaleString()} - ${job.salary?.max?.toLocaleString()}
                      </span>
                      <span>•</span>
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium text-[11px]">
                        {job.workMode}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:bg-red-50 hover:text-red-700"
                    icon={Trash2}
                    onClick={() => handleUnsave(job._id)}
                  >
                    Remove
                  </Button>
                  <Link to={`/jobs/${job._id}`}>
                    <Button variant="primary" size="sm" icon={ArrowRight}>
                      View & Apply
                    </Button>
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
