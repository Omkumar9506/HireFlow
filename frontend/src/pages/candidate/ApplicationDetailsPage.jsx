import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { Card, Skeleton } from '../../components/ui/Card';
import { StatusBadge, Badge } from '../../components/ui/StatusBadge';
import { Button } from '../../components/ui/Button';
import {
  ArrowLeft,
  Calendar,
  Building2,
  MapPin,
  FileText,
  Sparkles,
  CheckCircle2,
  Clock,
  ExternalLink,
} from 'lucide-react';

export const ApplicationDetailsPage = () => {
  const { id } = useParams();
  const [application, setApplication] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchApp = async () => {
      setIsLoading(true);
      try {
        const res = await api.get(`/applications/${id}`);
        setApplication(res.data.data);
      } catch (err) {
        console.error('Failed to load application:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchApp();
  }, [id]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!application) {
    return (
      <div className="max-w-lg mx-auto py-16 text-center">
        <h2 className="text-base font-bold text-slate-800">Application not found</h2>
        <Link to="/candidate/applications" className="mt-4 inline-block">
          <Button variant="primary" size="sm">Back to Applications</Button>
        </Link>
      </div>
    );
  }

  const job = application.jobId || {};
  const company = job.companyId || {};

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link
        to="/candidate/applications"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600"
      >
        <ArrowLeft className="w-4 h-4" /> Back to all applications
      </Link>

      {/* Header Card */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">{job.title}</h1>
              <StatusBadge status={application.status} />
            </div>
            <p className="text-xs font-medium text-slate-600 mt-1">
              {company.name} • {job.location} • Applied {new Date(application.appliedAt).toLocaleDateString()}
            </p>
          </div>
          <Link to={`/jobs/${job._id}`}>
            <Button variant="outline" size="sm" icon={ExternalLink}>
              View Job Requisition
            </Button>
          </Link>
        </div>

        {/* AI Match Overview */}
        <div className="mt-6 pt-6 border-t border-slate-100 grid sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-blue-900">AI Compatibility Score</span>
              <Badge variant="primary">AI-assisted</Badge>
            </div>
            <div className="text-3xl font-black text-blue-700">{application.matchScore}%</div>
            <p className="text-xs text-slate-600 mt-1">
              {application.matchAnalysis?.explanation || 'Evaluated against job competencies.'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
            <span className="font-bold text-slate-800">Submitted Resume</span>
            <p className="text-slate-600">{application.resumeId?.fileName || 'Primary profile resume'}</p>
            {application.resumeId?.fileUrl && (
              <a
                href={application.resumeId.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-blue-600 font-semibold hover:underline"
              >
                <FileText className="w-3.5 h-3.5" /> View Uploaded Document
              </a>
            )}
          </div>
        </div>
      </Card>

      {/* ATS Pipeline Timeline */}
      <Card>
        <h3 className="text-sm font-bold text-slate-900 mb-6 flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-600" /> Application Progression History
        </h3>

        <div className="space-y-6 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200">
          {(application.statusHistory || []).map((step, idx) => (
            <div key={idx} className="relative flex items-start gap-4">
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs ring-4 ring-white shrink-0 z-10">
                ✓
              </div>
              <div className="flex-1 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-900">
                    Moved to {step.toStatus}
                  </span>
                  <span className="text-slate-400">
                    {new Date(step.changedAt).toLocaleString()}
                  </span>
                </div>
                {step.reason && (
                  <p className="text-slate-600 mt-1">{step.reason}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
