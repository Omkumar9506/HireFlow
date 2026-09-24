import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Card, Skeleton, EmptyState } from '../../components/ui/Card';
import { StatusBadge, Badge } from '../../components/ui/StatusBadge';
import { Button } from '../../components/ui/Button';
import { Calendar, Clock, Video, Phone, MapPin, ExternalLink, CheckCircle2 } from 'lucide-react';

export const CandidateInterviewsPage = () => {
  const [interviews, setInterviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tab, setTab] = useState('UPCOMING');

  useEffect(() => {
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

    fetchInterviews();
  }, []);

  const upcomingInterviews = interviews.filter(
    (i) => i.status === 'SCHEDULED' || i.status === 'RESCHEDULED'
  );
  const pastInterviews = interviews.filter(
    (i) => i.status === 'COMPLETED' || i.status === 'CANCELLED'
  );

  const displayedList = tab === 'UPCOMING' ? upcomingInterviews : pastInterviews;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Interview Schedule
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Confirmed virtual screenings and technical conversations with hiring teams.
          </p>
        </div>

        <div className="flex gap-1.5 p-1 bg-white rounded-lg border border-slate-200">
          <button
            type="button"
            onClick={() => setTab('UPCOMING')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              tab === 'UPCOMING' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Upcoming ({upcomingInterviews.length})
          </button>
          <button
            type="button"
            onClick={() => setTab('PAST')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              tab === 'PAST' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Past ({pastInterviews.length})
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : displayedList.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title={tab === 'UPCOMING' ? 'No upcoming interviews scheduled' : 'No past interview records'}
          description="When an employer shortlists your application for an interview, it will appear here."
        />
      ) : (
        <div className="space-y-4">
          {displayedList.map((interview) => {
            const job = interview.applicationId?.jobId || {};
            const company = job.companyId || {};

            return (
              <Card key={interview._id} className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-bold text-slate-900">
                        {job.title || 'Technical Interview'}
                      </h3>
                      <StatusBadge status={interview.status} />
                      <Badge variant="primary">{interview.type}</Badge>
                    </div>

                    <p className="text-xs font-medium text-slate-600 mt-1">
                      {company.name} • Recruiter: {interview.recruiterId?.name || 'Talent Team'}
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

                    {interview.notes && (
                      <p className="mt-3 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                        <strong className="text-slate-800">Recruiter Notes:</strong> {interview.notes}
                      </p>
                    )}
                  </div>

                  <div className="shrink-0 flex items-center gap-2 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    {interview.meetingLink && interview.status === 'SCHEDULED' && (
                      <a
                        href={interview.meetingLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold text-xs shadow-xs hover:bg-blue-700 transition-colors"
                      >
                        <Video className="w-4 h-4" />
                        Join Virtual Room
                      </a>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
