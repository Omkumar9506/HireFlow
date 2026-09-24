import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Card, Skeleton, EmptyState } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Modal } from '../../components/ui/Modal';
import { FileCheck, MapPin, Building2, AlertTriangle, ArrowRight } from 'lucide-react';

export const ApplicationsPage = () => {
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  // Withdraw state
  const [selectedApp, setSelectedApp] = useState(null);
  const [withdrawReason, setWithdrawReason] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const fetchApplications = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/candidates/applications');
      setApplications(res.data.data || []);
    } catch (err) {
      console.error('Failed to load applications:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleWithdraw = async () => {
    if (!selectedApp) return;
    setIsWithdrawing(true);
    try {
      await api.post(`/applications/${selectedApp._id}/withdraw`, {
        reason: withdrawReason || 'Candidate decided to withdraw application',
      });
      setSelectedApp(null);
      setWithdrawReason('');
      fetchApplications();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to withdraw application');
    } finally {
      setIsWithdrawing(false);
    }
  };

  const filteredApps = applications.filter((app) => {
    if (filter === 'ALL') return true;
    if (filter === 'ACTIVE') return !['HIRED', 'REJECTED', 'WITHDRAWN'].includes(app.status);
    if (filter === 'INTERVIEWS') return app.status === 'INTERVIEW';
    if (filter === 'OFFERED') return ['SELECTED', 'OFFERED', 'HIRED'].includes(app.status);
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            My Job Applications
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track status progression and ATS evaluation stages across all positions.
          </p>
        </div>

        {/* Status filter tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-white rounded-lg border border-slate-200">
          {['ALL', 'ACTIVE', 'INTERVIEWS', 'OFFERED'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                filter === f
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      ) : filteredApps.length === 0 ? (
        <EmptyState
          icon={FileCheck}
          title="No applications in this category"
          description="Ready to explore new career opportunities? Search available requisitions."
          actionText="Discover Jobs"
          onAction={() => (window.location.href = '/jobs')}
        />
      ) : (
        <div className="space-y-4">
          {filteredApps.map((app) => {
            const canWithdraw = ['APPLIED', 'SCREENING', 'SHORTLISTED'].includes(app.status);
            return (
              <Card key={app._id} className="p-5 hover:border-slate-300 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center font-black text-blue-700 text-base shrink-0">
                      {app.jobId?.companyId?.name?.charAt(0) || 'C'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          to={`/candidate/applications/${app._id}`}
                          className="text-base font-bold text-slate-900 hover:text-blue-600"
                        >
                          {app.jobId?.title || 'Job Listing'}
                        </Link>
                        <StatusBadge status={app.status} />
                      </div>
                      <p className="text-xs font-medium text-slate-600 mt-0.5">
                        {app.jobId?.companyId?.name} • {app.jobId?.location}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-slate-500">
                        <span>Applied on {new Date(app.appliedAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <span className="font-semibold text-blue-700">
                          {app.matchScore}% AI match
                        </span>
                        {app.resumeId?.fileName && (
                          <>
                            <span>•</span>
                            <span className="text-slate-400">Resume: {app.resumeId.fileName}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center sm:flex-col sm:items-end gap-2 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <div className="flex items-center gap-2">
                      {canWithdraw && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:bg-red-50 hover:text-red-700"
                          onClick={() => setSelectedApp(app)}
                        >
                          Withdraw
                        </Button>
                      )}
                      <Link to={`/candidate/applications/${app._id}`}>
                        <Button variant="primary" size="sm" icon={ArrowRight}>
                          Track Status
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Withdraw Confirmation Modal */}
      <Modal
        isOpen={Boolean(selectedApp)}
        onClose={() => setSelectedApp(null)}
        title="Withdraw Job Application?"
        description={`Confirm withdrawing from ${selectedApp?.jobId?.title}`}
      >
        <div className="space-y-4">
          <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 flex items-start gap-2 text-xs text-amber-800">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              Withdrawing your application is final and will notify the recruiting team that you are no longer interested.
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Reason for withdrawal (Optional)
            </label>
            <textarea
              rows={3}
              className="w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Accepted another offer, relocation timing..."
              value={withdrawReason}
              onChange={(e) => setWithdrawReason(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="ghost" size="sm" onClick={() => setSelectedApp(null)}>
              Keep Application
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleWithdraw}
              isLoading={isWithdrawing}
            >
              Confirm Withdrawal
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
