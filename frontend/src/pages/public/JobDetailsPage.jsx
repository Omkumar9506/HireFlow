import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../store/AuthContext';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Textarea } from '../../components/ui/Select';
import { Badge, StatusBadge } from '../../components/ui/StatusBadge';
import { Card, Skeleton } from '../../components/ui/Card';
import { ROLES } from '../../constants';
import {
  MapPin,
  Briefcase,
  DollarSign,
  Calendar,
  CheckCircle2,
  Bookmark,
  Share2,
  Sparkles,
  ArrowLeft,
  Building2,
  Users,
} from 'lucide-react';

export const JobDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [job, setJob] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [candidateResumes, setCandidateResumes] = useState([]);
  const [applySuccess, setApplySuccess] = useState(false);
  const [applyError, setApplyError] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  // AI Match state
  const [aiMatch, setAiMatch] = useState(null);
  const [isLoadingAiMatch, setIsLoadingAiMatch] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      setIsLoading(true);
      try {
        const res = await api.get(`/jobs/${id}`);
        setJob(res.data.data);
        setIsSaved(res.data.data.isSaved);

        // If candidate, load candidate resumes and AI match
        if (isAuthenticated && user?.role === ROLES.CANDIDATE) {
          api.get('/candidates/resumes').then((rRes) => {
            const list = rRes.data.data || [];
            setCandidateResumes(list);
            const primary = list.find((r) => r.isPrimary) || list[0];
            if (primary) setSelectedResumeId(primary._id);
          });

          setIsLoadingAiMatch(true);
          api.post(`/ai/job/${id}/match`).then((mRes) => {
            setAiMatch(mRes.data.data);
          }).catch(() => {}).finally(() => setIsLoadingAiMatch(false));
        }
      } catch (err) {
        console.error('Failed to load job:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJob();
  }, [id, isAuthenticated, user]);

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    setApplyError('');
    setIsApplying(true);

    try {
      await api.post(`/jobs/${id}/apply`, {
        resumeId: selectedResumeId || undefined,
        coverLetter,
      });
      setApplySuccess(true);
      setJob((prev) => ({ ...prev, hasApplied: true }));
      setTimeout(() => {
        setIsModalOpen(false);
        setApplySuccess(false);
      }, 2000);
    } catch (err) {
      setApplyError(err.response?.data?.message || 'Failed to submit application.');
    } finally {
      setIsApplying(false);
    }
  };

  const toggleSave = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      if (isSaved) {
        await api.delete(`/jobs/${id}/save`);
        setIsSaved(false);
      } else {
        await api.post(`/jobs/${id}/save`);
        setIsSaved(true);
      }
    } catch (err) {
      console.warn('Save failed:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-6">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-800">Job Not Found</h2>
        <p className="text-xs text-slate-500 mt-1">This job requisition may have been closed or removed.</p>
        <Link to="/jobs" className="mt-4 inline-block">
          <Button variant="primary" size="sm">Browse Other Jobs</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back button */}
      <Link to="/jobs" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to job search
      </Link>

      {/* Main Header Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs mb-8">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
          <div className="flex items-start gap-5">
            <div className="w-16 h-16 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center font-black text-blue-700 text-xl shrink-0">
              {job.companyId?.name?.charAt(0) || 'C'}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-slate-900">{job.title}</h1>
                <StatusBadge status={job.status} />
              </div>
              <p className="text-sm font-medium text-slate-600 mt-1">
                {job.companyId?.name} • <span className="text-slate-500">{job.location}</span>
              </p>

              <div className="flex flex-wrap items-center gap-3 mt-4 text-xs text-slate-600">
                <span className="font-semibold text-slate-900 inline-flex items-center gap-1">
                  <DollarSign className="w-4 h-4 text-emerald-600 -mr-1" />
                  ${job.salary?.min?.toLocaleString()} - ${job.salary?.max?.toLocaleString()}{' '}
                  <span className="font-normal text-slate-500">per year</span>
                </span>
                <span className="text-slate-300">•</span>
                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                  {job.workMode}
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                  {job.employmentType?.replace('_', ' ')}
                </span>
                <span className="text-slate-500">
                  {job.experience?.min}-{job.experience?.max} years experience
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex sm:flex-col items-center sm:items-end gap-3 shrink-0">
            {job.hasApplied ? (
              <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Application Submitted
              </div>
            ) : job.status !== 'PUBLISHED' ? (
              <Button variant="secondary" disabled size="md">
                Listing Closed
              </Button>
            ) : (
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  if (!isAuthenticated) {
                    navigate('/login');
                  } else if (user?.role !== ROLES.CANDIDATE) {
                    alert('Only candidates can submit applications.');
                  } else {
                    setIsModalOpen(true);
                  }
                }}
              >
                Apply Now
              </Button>
            )}

            {user?.role === ROLES.CANDIDATE && (
              <button
                type="button"
                onClick={toggleSave}
                className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
                  isSaved
                    ? 'border-blue-200 bg-blue-50 text-blue-600'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-blue-600' : ''}`} />
                {isSaved ? 'Saved' : 'Save for later'}
              </button>
            )}
          </div>
        </div>

        {/* AI Match Overview Banner for Candidates */}
        {isAuthenticated && user?.role === ROLES.CANDIDATE && aiMatch && (
          <div className="mt-6 pt-6 border-t border-slate-100">
            <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-bold text-blue-950">AI Requisition Alignment Score</span>
                </div>
                <Badge variant="primary">AI-assisted insight</Badge>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-2xl font-black text-blue-700">{aiMatch.matchScore}%</div>
                <div className="flex-1">
                  <div className="w-full h-2 rounded-full bg-blue-200 overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: `${aiMatch.matchScore}%` }} />
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1.5 leading-relaxed">{aiMatch.explanation}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Grid Layout: Body & Company Details */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column: Job Description & Requirements */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <h3 className="text-base font-bold text-slate-900 mb-3">About the Role</h3>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {job.description}
            </p>

            {job.responsibilities && job.responsibilities.length > 0 && (
              <div className="mt-6">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2">
                  Key Responsibilities
                </h4>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
                  {job.responsibilities.map((r, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 shrink-0" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {job.requirements && job.requirements.length > 0 && (
              <div className="mt-6">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2">
                  Requirements & Qualifications
                </h4>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
                  {job.requirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 shrink-0" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {job.benefits && job.benefits.length > 0 && (
              <div className="mt-6">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2">
                  Benefits & Perks
                </h4>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
                  {job.benefits.map((b, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-2 shrink-0" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Requisition Meta & Company Overview */}
        <div className="space-y-6">
          <Card>
            <h3 className="text-sm font-bold text-slate-900 mb-4">Requisition Summary</h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Open Positions</span>
                <span className="font-semibold text-slate-800">{job.openings} opening(s)</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Employment Type</span>
                <span className="font-semibold text-slate-800">{job.employmentType}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Work Arrangement</span>
                <span className="font-semibold text-slate-800">{job.workMode}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Experience Needed</span>
                <span className="font-semibold text-slate-800">{job.experience?.min}-{job.experience?.max} Years</span>
              </div>
              {job.applicationDeadline && (
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Deadline</span>
                  <span className="font-semibold text-slate-800">
                    {new Date(job.applicationDeadline).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>

            <div className="mt-5">
              <h4 className="text-xs font-bold text-slate-700 mb-2">Required Skills</h4>
              <div className="flex flex-wrap gap-1.5">
                {job.skills?.map((s) => (
                  <span key={s} className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-medium">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="text-sm font-bold text-slate-900 mb-3">About {job.companyId?.name}</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              {job.companyId?.description || 'Leading technology enterprise providing scalable digital solutions.'}
            </p>
            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span>{job.companyId?.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <span>{job.companyId?.employeeCount || '50-250'} Employees</span>
              </div>
              {job.companyId?.website && (
                <div className="pt-2">
                  <a
                    href={job.companyId.website}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-semibold text-blue-600 hover:underline"
                  >
                    Visit company website →
                  </a>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Application Submission Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Apply for ${job.title}`}
        description={`Submit your application to ${job.companyId?.name}`}
      >
        {applySuccess ? (
          <div className="text-center py-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Application Submitted!</h3>
            <p className="text-xs text-slate-500 mt-1">
              Your profile and resume have been sent to the recruiter. Track your status in your dashboard.
            </p>
          </div>
        ) : (
          <form onSubmit={handleApplySubmit} className="space-y-4">
            {applyError && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
                {applyError}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Select Resume for Submission <span className="text-red-500">*</span>
              </label>
              {candidateResumes.length === 0 ? (
                <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800">
                  You haven&apos;t uploaded a resume yet.{' '}
                  <Link to="/candidate/resume" className="font-bold underline">
                    Upload a resume first
                  </Link>
                </div>
              ) : (
                <select
                  value={selectedResumeId}
                  onChange={(e) => setSelectedResumeId(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {candidateResumes.map((r) => (
                    <option key={r._id} value={r._id}>
                      {r.fileName} {r.isPrimary ? '(Primary Resume)' : ''}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <Textarea
              label="Cover Note / Motivation (Optional)"
              placeholder="Briefly describe why your skills make you a great fit for this position..."
              rows={4}
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
            />

            <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
              <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isApplying}
                disabled={candidateResumes.length === 0}
              >
                Submit Application
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
