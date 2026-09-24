import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { Card, Skeleton, EmptyState } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge, Badge } from '../../components/ui/StatusBadge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Select';
import {
  ArrowLeft,
  Calendar,
  Sparkles,
  FileText,
  User,
  CheckCircle2,
  XCircle,
  Plus,
  Clock,
  ArrowRight,
  ExternalLink,
  Search,
} from 'lucide-react';

const PIPELINE_COLUMNS = [
  { id: 'APPLIED', title: 'Applied', color: 'border-blue-500' },
  { id: 'SCREENING', title: 'Screening', color: 'border-purple-500' },
  { id: 'SHORTLISTED', title: 'Shortlisted', color: 'border-cyan-500' },
  { id: 'INTERVIEW', title: 'Interview', color: 'border-amber-500' },
  { id: 'SELECTED', title: 'Selected', color: 'border-indigo-500' },
  { id: 'OFFERED', title: 'Offered', color: 'border-teal-500' },
  { id: 'HIRED', title: 'Hired', color: 'border-emerald-600' },
];

export const JobApplicationsKanbanPage = () => {
  const { id } = useParams(); // Job ID
  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedApp, setSelectedApp] = useState(null);

  // Note modal state
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [noteText, setNoteText] = useState('');

  // Interview Schedule modal state
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
  const [interviewType, setInterviewType] = useState('ONLINE');
  const [scheduledAt, setScheduledAt] = useState('');
  const [duration, setDuration] = useState(45);
  const [meetingLink, setMeetingLink] = useState('https://meet.google.com/hfw-interview-room');
  const [interviewNotes, setInterviewNotes] = useState('');
  const [isScheduling, setIsScheduling] = useState(false);

  const fetchPipelineData = async () => {
    setIsLoading(true);
    try {
      const [jobRes, appsRes] = await Promise.all([
        api.get(`/jobs/${id}`),
        api.get(`/applications/job/${id}${search ? `?search=${search}` : ''}`),
      ]);
      setJob(jobRes.data.data);
      setApplications(appsRes.data.data || []);
      // If an application was selected, update its reference
      if (selectedApp) {
        const refreshed = (appsRes.data.data || []).find((a) => a._id === selectedApp._id);
        if (refreshed) setSelectedApp(refreshed);
      }
    } catch (err) {
      console.error('Failed to load ATS pipeline:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPipelineData();
  }, [id, search]);

  const handleAdvanceStatus = async (appId, newStatus) => {
    try {
      await api.patch(`/applications/${appId}/status`, {
        status: newStatus,
        reason: `Advanced in ATS pipeline to ${newStatus}`,
      });
      fetchPipelineData();
    } catch (err) {
      alert(err.response?.data?.message || 'Status transition rejected');
    }
  };

  const handleReject = async (appId) => {
    const reason = window.prompt('Optional reason for candidate rejection:', 'Candidate did not meet required criteria at this stage');
    if (reason === null) return;
    try {
      await api.post(`/applications/${appId}/reject`, { reason });
      fetchPipelineData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject application');
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteText.trim() || !selectedApp) return;
    try {
      const res = await api.post(`/applications/${selectedApp._id}/notes`, { note: noteText });
      setSelectedApp((prev) => ({ ...prev, recruiterNotes: res.data.data }));
      setNoteText('');
      setIsNoteModalOpen(false);
      fetchPipelineData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add note');
    }
  };

  const handleScheduleInterview = async (e) => {
    e.preventDefault();
    if (!selectedApp || !scheduledAt) return;
    setIsScheduling(true);

    try {
      await api.post('/interviews', {
        applicationId: selectedApp._id,
        type: interviewType,
        scheduledAt,
        duration: parseInt(duration, 10) || 45,
        meetingLink,
        notes: interviewNotes,
      });
      setIsInterviewModalOpen(false);
      setInterviewNotes('');
      fetchPipelineData();
      alert('Interview scheduled and invitation dispatched to candidate!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to schedule interview');
    } finally {
      setIsScheduling(false);
    }
  };

  const getNextValidStage = (currentStatus) => {
    const map = {
      APPLIED: 'SCREENING',
      SCREENING: 'SHORTLISTED',
      SHORTLISTED: 'INTERVIEW',
      INTERVIEW: 'SELECTED',
      SELECTED: 'OFFERED',
      OFFERED: 'HIRED',
    };
    return map[currentStatus] || null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/recruiter/jobs"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 mb-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Requisitions
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              ATS Pipeline: {job?.title || 'Loading Requisition...'}
            </h1>
            <StatusBadge status={job?.status} />
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {job?.companyId?.name} • {applications.length} Candidates Under Evaluation
          </p>
        </div>

        <div className="w-full sm:w-64">
          <Input
            icon={Search}
            placeholder="Search candidate name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Kanban Board Container */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {PIPELINE_COLUMNS.map((col) => (
            <div key={col.id} className="bg-slate-100/70 p-3 rounded-xl h-96">
              <Skeleton className="h-6 w-full mb-3" />
              <Skeleton className="h-24 w-full mb-2" />
              <Skeleton className="h-24 w-full" />
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-[1300px]">
            {PIPELINE_COLUMNS.map((col) => {
              const colApps = applications.filter((app) => app.status === col.id);
              return (
                <div
                  key={col.id}
                  className="flex-1 min-w-[190px] bg-slate-100/70 rounded-xl border border-slate-200/80 p-3 flex flex-col max-h-[750px]"
                >
                  {/* Column Header */}
                  <div className={`flex items-center justify-between pb-2 mb-3 border-b-2 ${col.color}`}>
                    <span className="text-xs font-bold text-slate-800">{col.title}</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white text-slate-700 border border-slate-200 shadow-2xs">
                      {colApps.length}
                    </span>
                  </div>

                  {/* Cards in column */}
                  <div className="space-y-3 overflow-y-auto flex-1 pr-1">
                    {colApps.length === 0 ? (
                      <div className="py-8 text-center text-[11px] text-slate-400 italic">
                        Empty stage
                      </div>
                    ) : (
                      colApps.map((app) => {
                        const candidate = app.candidateId || {};
                        const user = candidate.userId || {};
                        const nextStage = getNextValidStage(app.status);

                        return (
                          <div
                            key={app._id}
                            onClick={() => setSelectedApp(app)}
                            className="bg-white rounded-lg border border-slate-200 p-3 shadow-xs hover:border-blue-400 hover:shadow-sm cursor-pointer transition-all space-y-2.5"
                          >
                            <div className="flex items-start justify-between gap-1.5">
                              <div>
                                <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                                  {user.name || 'Candidate'}
                                </h4>
                                <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
                              </div>
                              <span className="text-[11px] font-black text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 shrink-0">
                                {app.matchScore}%
                              </span>
                            </div>

                            {candidate.skills && candidate.skills.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {candidate.skills.slice(0, 2).map((s) => (
                                  <span key={s} className="px-1.5 py-0.2 rounded bg-slate-50 text-slate-600 text-[9px] font-medium border border-slate-100">
                                    {s}
                                  </span>
                                ))}
                              </div>
                            )}

                            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                              <span>{new Date(app.appliedAt).toLocaleDateString()}</span>

                              <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                {nextStage && (
                                  <button
                                    type="button"
                                    onClick={() => handleAdvanceStatus(app._id, nextStage)}
                                    className="px-2 py-0.5 rounded bg-blue-600 text-white font-bold text-[10px] hover:bg-blue-700 transition-colors"
                                    title={`Move to ${nextStage}`}
                                  >
                                    → {nextStage}
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Candidate Application Evaluation Modal */}
      <Modal
        isOpen={Boolean(selectedApp)}
        onClose={() => setSelectedApp(null)}
        title={selectedApp?.candidateId?.userId?.name || 'Candidate Evaluation'}
        description={`Application for ${job?.title} (Match: ${selectedApp?.matchScore}%)`}
        maxWidth="max-w-3xl"
      >
        {selectedApp && (
          <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-1">
            {/* Top Bar Status & Action Triggers */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Current Stage:</span>
                <StatusBadge status={selectedApp.status} />
              </div>

              <div className="flex items-center gap-2">
                {getNextValidStage(selectedApp.status) && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleAdvanceStatus(selectedApp._id, getNextValidStage(selectedApp.status))}
                  >
                    Advance to {getNextValidStage(selectedApp.status)}
                  </Button>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  icon={Calendar}
                  onClick={() => setIsInterviewModalOpen(true)}
                >
                  Schedule Interview
                </Button>

                {!['REJECTED', 'HIRED', 'WITHDRAWN'].includes(selectedApp.status) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:bg-red-50 hover:text-red-700"
                    onClick={() => handleReject(selectedApp._id)}
                  >
                    Reject
                  </Button>
                )}
              </div>
            </div>

            {/* Candidate Bio & Details */}
            <div className="grid sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-500 font-medium">Candidate Headline:</span>
                <p className="font-semibold text-slate-800 mt-0.5">
                  {selectedApp.candidateId?.headline || 'Full-Stack Developer'}
                </p>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Location:</span>
                <p className="font-semibold text-slate-800 mt-0.5">
                  {selectedApp.candidateId?.location || 'Not specified'}
                </p>
              </div>
            </div>

            {/* AI Match Breakdown Card */}
            <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-blue-950">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  AI Requisition Compatibility Assessment
                </div>
                <Badge variant="primary">{selectedApp.matchScore}% Match Score</Badge>
              </div>
              <p className="text-slate-700 leading-relaxed">
                {selectedApp.matchAnalysis?.explanation || 'Candidate evaluated against job description requirements.'}
              </p>

              {selectedApp.matchAnalysis?.matchedSkills && (
                <div>
                  <span className="font-semibold text-emerald-800 text-[11px] uppercase">
                    Matched Competencies:
                  </span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {selectedApp.matchAnalysis.matchedSkills.map((s) => (
                      <span key={s} className="px-2 py-0.5 rounded bg-white text-emerald-700 border border-emerald-200 text-[11px] font-semibold">
                        ✓ {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Resume Document Link */}
            {selectedApp.resumeId && (
              <div className="flex items-center justify-between p-3.5 rounded-lg border border-slate-200 bg-white">
                <div className="flex items-center gap-2.5">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-xs font-bold text-slate-900">{selectedApp.resumeId.fileName}</p>
                    <p className="text-[11px] text-slate-500">{(selectedApp.resumeId.fileSize / 1024).toFixed(0)} KB PDF</p>
                  </div>
                </div>
                <a
                  href={selectedApp.resumeId.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline"
                >
                  Open Document <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}

            {/* Recruiter Notes Section */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Internal Recruiter Evaluation Notes ({selectedApp.recruiterNotes?.length || 0})
                </h4>
                <Button variant="outline" size="sm" icon={Plus} onClick={() => setIsNoteModalOpen(true)}>
                  Add Evaluation Note
                </Button>
              </div>

              <div className="space-y-2">
                {(selectedApp.recruiterNotes || []).length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No notes recorded yet</p>
                ) : (
                  selectedApp.recruiterNotes.map((note, i) => (
                    <div key={i} className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                      <p className="text-slate-800 leading-relaxed">{note.note}</p>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        {new Date(note.createdAt).toLocaleString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Add Note Sub-Modal */}
      <Modal
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        title="Add Recruiter Note"
      >
        <form onSubmit={handleAddNote} className="space-y-4">
          <Textarea
            label="Evaluation Note"
            placeholder="Document candidate interview feedback, screening highlights, or salary expectations..."
            rows={4}
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            required
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setIsNoteModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Note
            </Button>
          </div>
        </form>
      </Modal>

      {/* Schedule Interview Sub-Modal */}
      <Modal
        isOpen={isInterviewModalOpen}
        onClose={() => setIsInterviewModalOpen(false)}
        title="Schedule Candidate Interview"
        description={`Set up a conversation with ${selectedApp?.candidateId?.userId?.name}`}
      >
        <form onSubmit={handleScheduleInterview} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Interview Type</label>
              <select
                value={interviewType}
                onChange={(e) => setInterviewType(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-900 bg-white"
              >
                <option value="ONLINE">Online Virtual Meeting</option>
                <option value="PHONE">Phone Call</option>
                <option value="OFFLINE">Onsite Office</option>
              </select>
            </div>
            <Input
              label="Duration (Minutes)"
              type="number"
              step={15}
              min={15}
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              required
            />
          </div>

          <Input
            label="Date & Time"
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            required
          />

          <Input
            label="Meeting Room Link (Google Meet / Teams / Zoom)"
            value={meetingLink}
            onChange={(e) => setMeetingLink(e.target.value)}
            placeholder="https://meet.google.com/..."
          />

          <Textarea
            label="Preparation Notes for Candidate (Optional)"
            placeholder="Focus areas: System architecture and coding review..."
            rows={3}
            value={interviewNotes}
            onChange={(e) => setInterviewNotes(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="ghost" size="sm" onClick={() => setIsInterviewModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isScheduling}>
              Confirm & Dispatch Invite
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
