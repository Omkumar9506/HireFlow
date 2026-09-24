import { Interview } from './interview.model.js';
import { Application } from '../applications/application.model.js';
import { Candidate } from '../candidates/candidate.model.js';
import { Job } from '../jobs/job.model.js';
import { ApiError } from '../../utils/ApiError.js';
import {
  INTERVIEW_STATUS,
  APPLICATION_STATUS,
  ROLES,
} from '../../utils/constants.js';
import { notificationService } from '../../services/notification.service.js';
import { emailService } from '../../services/email.service.js';

export const interviewService = {
  scheduleInterview: async (recruiterId, data) => {
    const { applicationId, type, scheduledAt, duration, meetingLink, notes } = data;

    const application = await Application.findById(applicationId)
      .populate({ path: 'jobId', populate: { path: 'companyId' } })
      .populate({ path: 'candidateId', populate: { path: 'userId' } });

    if (!application) {
      throw new ApiError(404, 'Application not found');
    }

    if (application.jobId.recruiterId.toString() !== recruiterId.toString()) {
      throw new ApiError(403, 'You do not own this job opening');
    }

    // Auto-advance status to INTERVIEW if valid
    if (application.status === APPLICATION_STATUS.SHORTLISTED || application.status === APPLICATION_STATUS.SCREENING) {
      application.status = APPLICATION_STATUS.INTERVIEW;
      application.statusHistory.push({
        fromStatus: application.status,
        toStatus: APPLICATION_STATUS.INTERVIEW,
        changedBy: recruiterId,
        reason: 'Interview scheduled',
        changedAt: new Date(),
      });
      await application.save();
    }

    const interview = await Interview.create({
      applicationId: application._id,
      recruiterId,
      candidateId: application.candidateId._id,
      type,
      scheduledAt: new Date(scheduledAt),
      duration: duration || 45,
      meetingLink: meetingLink || '',
      status: INTERVIEW_STATUS.SCHEDULED,
      notes: notes || '',
    });

    const candidateUser = application.candidateId.userId;
    const jobTitle = application.jobId.title;
    const companyName = application.jobId.companyId.name;

    // Send In-App Notification
    await notificationService.createNotification({
      userId: candidateUser._id,
      type: 'INTERVIEW_SCHEDULED',
      title: `Interview Scheduled: ${jobTitle}`,
      message: `An interview has been scheduled for ${new Date(scheduledAt).toLocaleString()} with ${companyName}.`,
      metadata: { interviewId: interview._id, applicationId: application._id },
    });

    // Send Email
    emailService.sendInterviewScheduledEmail(
      candidateUser.email,
      candidateUser.name,
      jobTitle,
      companyName,
      interview
    );

    return interview;
  },

  getInterviews: async (userId, userRole, query = {}) => {
    const filter = {};

    if (userRole === ROLES.CANDIDATE) {
      const candidate = await Candidate.findOne({ userId });
      if (!candidate) return [];
      filter.candidateId = candidate._id;
    } else if (userRole === ROLES.RECRUITER) {
      filter.recruiterId = userId;
    }

    if (query.status) {
      filter.status = query.status;
    }

    return await Interview.find(filter)
      .populate({
        path: 'applicationId',
        select: 'status matchScore coverLetter appliedAt',
        populate: {
          path: 'jobId',
          select: 'title location workMode companyId',
          populate: { path: 'companyId', select: 'name logo' },
        },
      })
      .populate({
        path: 'candidateId',
        select: 'phone location headline skills',
        populate: { path: 'userId', select: 'name email' },
      })
      .populate('recruiterId', 'name email')
      .sort({ scheduledAt: 1 });
  },

  getInterviewById: async (interviewId, userId, userRole) => {
    const interview = await Interview.findById(interviewId)
      .populate({
        path: 'applicationId',
        populate: [
          { path: 'jobId', populate: { path: 'companyId' } },
          { path: 'resumeId' },
        ],
      })
      .populate({
        path: 'candidateId',
        populate: { path: 'userId', select: 'name email' },
      })
      .populate('recruiterId', 'name email');

    if (!interview) {
      throw new ApiError(404, 'Interview not found');
    }

    return interview;
  },

  updateInterview: async (interviewId, userId, userRole, updateData) => {
    const interview = await Interview.findById(interviewId).populate({
      path: 'candidateId',
      populate: { path: 'userId', select: 'name email' },
    });

    if (!interview) throw new ApiError(404, 'Interview not found');

    if (userRole !== ROLES.ADMIN && interview.recruiterId.toString() !== userId.toString()) {
      throw new ApiError(403, 'Unauthorized');
    }

    const wasRescheduled = updateData.scheduledAt && new Date(updateData.scheduledAt).getTime() !== new Date(interview.scheduledAt).getTime();

    Object.assign(interview, updateData);
    if (wasRescheduled) {
      interview.status = INTERVIEW_STATUS.RESCHEDULED;
    }

    await interview.save();

    if (wasRescheduled) {
      await notificationService.createNotification({
        userId: interview.candidateId.userId._id,
        type: 'INTERVIEW_RESCHEDULED',
        title: 'Interview Rescheduled',
        message: `Your interview has been rescheduled to ${new Date(interview.scheduledAt).toLocaleString()}.`,
        metadata: { interviewId: interview._id },
      });
    }

    return interview;
  },

  submitFeedback: async (interviewId, userId, feedbackData) => {
    const interview = await Interview.findById(interviewId);
    if (!interview) throw new ApiError(404, 'Interview not found');

    if (interview.recruiterId.toString() !== userId.toString()) {
      throw new ApiError(403, 'Unauthorized');
    }

    interview.feedback = {
      ...feedbackData,
      submittedAt: new Date(),
    };
    interview.status = INTERVIEW_STATUS.COMPLETED;
    await interview.save();

    return interview;
  },
};
