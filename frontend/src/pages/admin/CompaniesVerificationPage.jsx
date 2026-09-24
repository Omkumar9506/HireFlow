import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Card, Skeleton, EmptyState } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Modal } from '../../components/ui/Modal';
import { Building, CheckCircle, XCircle, Globe, MapPin, AlertCircle } from 'lucide-react';

export const CompaniesVerificationPage = () => {
  const [companies, setCompanies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const fetchCompanies = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/admin/companies${filter ? `?status=${filter}` : ''}`);
      setCompanies(res.data.data.items || []);
    } catch (err) {
      console.error('Failed to load companies:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, [filter]);

  const handleVerify = async (companyId, status) => {
    try {
      await api.patch(`/companies/${companyId}/verify`, {
        status,
        rejectionReason: status === 'REJECTED' ? rejectionReason : undefined,
      });
      setSelectedCompany(null);
      setRejectionReason('');
      fetchCompanies();
    } catch (err) {
      alert(err.response?.data?.message || 'Verification update failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Employer Company Verification
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Only approved companies are permitted to publish live job requisitions on HireFlow.
          </p>
        </div>

        <div className="flex gap-1 p-1 bg-white rounded-lg border border-slate-200">
          {['', 'PENDING', 'APPROVED', 'REJECTED'].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                filter === s ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {s ? s.charAt(0) + s.slice(1).toLowerCase() : 'All Companies'}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : companies.length === 0 ? (
        <EmptyState
          icon={Building}
          title="No companies match the selected filter"
          description="Pending employer verification requests will appear here for administrative approval."
        />
      ) : (
        <div className="space-y-4">
          {companies.map((comp) => (
            <Card key={comp._id} className="p-5">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="text-base font-bold text-slate-900">{comp.name}</h3>
                    <StatusBadge status={comp.verificationStatus} />
                    <span className="text-xs font-medium text-slate-500 px-2 py-0.5 rounded bg-slate-100">
                      {comp.industry}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                    {comp.description || 'No corporate description provided.'}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" /> {comp.location}
                    </span>
                    {comp.website && (
                      <a
                        href={comp.website}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:underline flex items-center gap-1 font-semibold"
                      >
                        <Globe className="w-3.5 h-3.5" /> {comp.website}
                      </a>
                    )}
                    <span>Registered by: <strong>{comp.createdBy?.name || comp.createdBy?.email}</strong></span>
                  </div>

                  {comp.rejectionReason && (
                    <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
                      <strong>Rejection Reason:</strong> {comp.rejectionReason}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  {comp.verificationStatus !== 'APPROVED' && (
                    <Button
                      variant="success"
                      size="sm"
                      icon={CheckCircle}
                      onClick={() => handleVerify(comp._id, 'APPROVED')}
                    >
                      Approve
                    </Button>
                  )}

                  {comp.verificationStatus !== 'REJECTED' && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:bg-red-50 hover:text-red-700"
                      icon={XCircle}
                      onClick={() => setSelectedCompany(comp)}
                    >
                      Reject
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      <Modal
        isOpen={Boolean(selectedCompany)}
        onClose={() => setSelectedCompany(null)}
        title={`Reject ${selectedCompany?.name}?`}
        description="Provide a constructive reason explaining why verification was rejected"
      >
        <div className="space-y-4">
          <textarea
            rows={3}
            className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
            placeholder="e.g. Unverified business email domain, incomplete corporate documentation..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
          />

          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setSelectedCompany(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => handleVerify(selectedCompany._id, 'REJECTED')}
            >
              Confirm Rejection
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
