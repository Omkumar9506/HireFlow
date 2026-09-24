import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Card, Skeleton, EmptyState } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge, Badge } from '../../components/ui/StatusBadge';
import { Modal } from '../../components/ui/Modal';
import { Select, Textarea } from '../../components/ui/Select';
import {
  Calendar,
  Clock,
  Video,
  CheckCircle2,
  Award,
  ExternalLink,
} from 'lucide-react';

export const RecruiterInterviewsPage = () => {
  const [interviews, setInterviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInterview, setSelectedInterview] = useState(null);

  // Feedback form state
  const [rating, setRating] = useState(4);
  const [technicalSkillScore, setTechnicalSkillScore] = useState(4);
  const [communicationScore, setCommunicationScore] = useState(4);
  const [cultureFitScore, setCultureFitScore] = useState(4);
  const [strengths, setStrengths] = useState('');
  const [weaknesses, setWeaknesses] = useState('');
  const [recommendation, setRecommendation] = useState('HIRE');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchInterviews = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/interviews');
      setInterviews(res.data.data || []);
    } catch (err) {
      console.error('Failed to load interviews:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, []);

  const handleOpenFeedback = (interview) => {
    setSelectedInterview(interview);
    if (interview.feedback) {
      setRating(interview.feedback.rating || 4);
      setTechnicalSkillScore(interview.feedback.technicalSkillScore || 4);
      setCommunicationScore(interview.feedback.communicationScore || 4);
      setCultureFitScore(interview.feedback.cultureFitScore || 4);
      setStrengths(interview.feedback.strengths || '');
      setWeaknesses(interview.feedback.weaknesses || '');
      setRecommendation(interview.feedback.recommendation || 'HIRE');
    }
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    if (!selectedInterview) return;
    setIsSubmitting(true);

    try {
      await api.post(`/interviews/${selectedInterview._id}/feedback`, {
        rating,
        technicalSkillScore,
        communicationScore,
        cultureFitScore,
        strengths,
        weaknesses,
        recommendation,
      });
      setSelectedInterview(null);
      fetchInterviews();
      alert('Evaluation rubric submitted successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          Interview Management & Candidate Scorecards
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Conduct interviews and submit structured evaluation rubrics for hiring alignment.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      ) : interviews.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No interviews scheduled yet"
          description="Advance qualified candidates to the Interview stage from your ATS pipeline board to schedule conversations."
        />
      ) : (
        <div className="space-y-4">
          {interviews.map((interview) => {
            const candidateUser = interview.candidateId?.userId || {};
            const job = interview.applicationId?.jobId || {};

            return (
              <Card key={interview._id} className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-bold text-slate-900">
                        {candidateUser.name || 'Candidate'}
                      </h3>
                      <StatusBadge status={interview.status} />
                      <Badge variant="primary">{interview.type}</Badge>
                      {interview.feedback?.recommendation && (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                          {interview.feedback.recommendation.replace('_', ' ')}
                        </span>
                      )}
                    </div>

                    <p className="text-xs font-medium text-slate-600 mt-1">
                      Role: <strong className="text-slate-900">{job.title || 'Requisition'}</strong> • Candidate: {candidateUser.email}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-600">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                        <Calendar className="w-3.5 h-3.5 text-blue-600" />
                        <span>{new Date(interview.scheduledAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{new Date(interview.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({interview.duration} mins)</span>
                      </div>
                    </div>

                    {interview.meetingLink && (
                      <div className="mt-2 text-xs">
                        <a
                          href={interview.meetingLink}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:underline font-semibold flex items-center gap-1"
                        >
                          <Video className="w-3.5 h-3.5" /> Meeting Link: {interview.meetingLink}
                        </a>
                      </div>
                    )}

                    {interview.feedback && (
                      <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
                        <div className="flex gap-4 font-semibold text-slate-800">
                          <span>Technical: {interview.feedback.technicalSkillScore}/5</span>
                          <span>Communication: {interview.feedback.communicationScore}/5</span>
                          <span>Culture: {interview.feedback.cultureFitScore}/5</span>
                        </div>
                        {interview.feedback.strengths && (
                          <p className="text-slate-600 pt-1">
                            <strong>Strengths:</strong> {interview.feedback.strengths}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="shrink-0 flex items-center gap-2 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <Button
                      variant={interview.feedback ? 'outline' : 'primary'}
                      size="sm"
                      icon={Award}
                      onClick={() => handleOpenFeedback(interview)}
                    >
                      {interview.feedback ? 'Update Scorecard' : 'Submit Scorecard'}
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Evaluation Rubric Modal */}
      <Modal
        isOpen={Boolean(selectedInterview)}
        onClose={() => setSelectedInterview(null)}
        title="Candidate Interview Scorecard & Rubric"
        description={`Candidate: ${selectedInterview?.candidateId?.userId?.name}`}
      >
        <form onSubmit={handleSubmitFeedback} className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Technical Skill (1-5)</label>
              <select
                value={technicalSkillScore}
                onChange={(e) => setTechnicalSkillScore(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs bg-white text-slate-900"
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>{n} Stars</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Communication (1-5)</label>
              <select
                value={communicationScore}
                onChange={(e) => setCommunicationScore(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs bg-white text-slate-900"
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>{n} Stars</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Culture Alignment (1-5)</label>
              <select
                value={cultureFitScore}
                onChange={(e) => setCultureFitScore(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs bg-white text-slate-900"
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>{n} Stars</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Final Hiring Recommendation</label>
            <select
              value={recommendation}
              onChange={(e) => setRecommendation(e.target.value)}
              className="w-full rounded-lg border border-slate-300 p-2 text-xs bg-white text-slate-900 font-semibold"
            >
              <option value="STRONG_HIRE">Strong Hire (Top Tier)</option>
              <option value="HIRE">Hire (Meets Criteria)</option>
              <option value="NEUTRAL">Neutral / Needs Second Opinion</option>
              <option value="DO_NOT_HIRE">Do Not Hire</option>
            </select>
          </div>

          <Textarea
            label="Observed Strengths"
            rows={2}
            placeholder="Clean code architecture, solid understanding of distributed systems..."
            value={strengths}
            onChange={(e) => setStrengths(e.target.value)}
          />

          <Textarea
            label="Areas for Growth / Concerns"
            rows={2}
            placeholder="Could improve in asynchronous error handling edge cases..."
            value={weaknesses}
            onChange={(e) => setWeaknesses(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="ghost" size="sm" onClick={() => setSelectedInterview(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
              Save Evaluation Rubric
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
