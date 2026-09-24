import { Application } from './application.model.js';
import { Job } from '../jobs/job.model.js';
import { Candidate } from '../candidates/candidate.model.js';
import { ApiError } from '../../utils/ApiError.js';
import {
  APPLICATION_STATUS,
  VALID_STATUS_TRANSITIONS,
  ROLES,
} from '../../utils/constants.js';
import { notificationService } from '../../services/notification.service.js';
import { emailService } from '../../services/email.service.js';

export const applicationService = {
  getApplicationById: async (applicationId, userId, userRole) => {
    const application = await Application.findById(applicationId)
      .populate({
        path: 'jobId',
        populate: { path: 'companyId', select: 'name logo' },
      })
      .populate({
        path: 'candidateId',
        populate: { path: 'userId', select: 'name email' },
      })
      .populate('resumeId')
      .populate('recruiterNotes.authorId', 'name email');

    if (!application) {
      throw new ApiError(404, 'Application not found');
    }

    // Access control
    if (userRole === ROLES.CANDIDATE) {
      if (application.candidateId.userId._id.toString() !== userId.toString()) {
        throw new ApiError(403, 'You are not authorized to view this application');
      }
    } else if (userRole === ROLES.RECRUITER) {
      if (application.jobId.recruiterId.toString() !== userId.toString()) {
        throw new ApiError(403, 'You are not authorized to view this application');
      }
    }

    return application;
  },

  getJobApplications: async (jobId, userId, userRole, query = {}) => {
    const job = await Job.findById(jobId);
    if (!job) throw new ApiError(404, 'Job not found');

    if (userRole !== ROLES.ADMIN && job.recruiterId.toString() !== userId.toString()) {
      throw new ApiError(403, 'You do not own this job listing');
    }

    const filter = { jobId };
    if (query.status) {
      filter.status = query.status;
    }

    let applications = await Application.find(filter)
      .populate({
        path: 'candidateId',
        populate: { path: 'userId', select: 'name email' },
      })
      .populate('resumeId', 'fileName fileUrl aiAnalysis')
      .sort(query.sortByScore === 'true' ? { matchScore: -1 } : { appliedAt: -1 });

    if (query.search) {
      const q = query.search.toLowerCase();
      applications = applications.filter((app) =>
        app.candidateId?.userId?.name?.toLowerCase().includes(q) ||
        app.candidateId?.userId?.email?.toLowerCase().includes(q)
      );
    }

    return applications;
  },

  updateStatus: async (applicationId, userId, userRole, newStatus, reason = '') => {
    const application = await Application.findById(applicationId)
      .populate({
        path: 'jobId',
        populate: { path: 'companyId', select: 'name' },
      })
      .populate({
        path: 'candidateId',
        populate: { path: 'userId', select: 'name email' },
      });

    if (!application) {
      throw new ApiError(404, 'Application not found');
    }

    const currentStatus = application.status;

    // Check Candidate withdrawal
    if (newStatus === APPLICATION_STATUS.WITHDRAWN) {
      if (userRole !== ROLES.CANDIDATE || application.candidateId.userId._id.toString() !== userId.toString()) {
        throw new ApiError(403, 'Only the applicant can withdraw this application.');
      }
    } else {
      // Recruiter or Admin status transition
      if (userRole === ROLES.CANDIDATE) {
        throw new ApiError(403, 'Candidates cannot modify application evaluation stage.');
      }
      if (userRole === ROLES.RECRUITER && application.jobId.recruiterId.toString() !== userId.toString()) {
        throw new ApiError(403, 'You do not own this job requisition.');
      }
    }

    // ATS State Machine Validation
    const allowedNextStatuses = VALID_STATUS_TRANSITIONS[currentStatus] || [];
    if (!allowedNextStatuses.includes(newStatus)) {
      throw new ApiError(
        400,
        `Invalid ATS pipeline transition: Cannot move application from '${currentStatus}' to '${newStatus}'. Allowed next steps: ${allowedNextStatuses.length ? allowedNextStatuses.join(', ') : 'None (Terminal state)'}`
      );
    }

    // Apply Transition
    application.status = newStatus;
    application.statusHistory.push({
      fromStatus: currentStatus,
      toStatus: newStatus,
      changedBy: userId,
      reason,
      changedAt: new Date(),
    });

    await application.save();

    // Trigger Notification & Email
    const candidateUser = application.candidateId.userId;
    const jobTitle = application.jobId.title;
    const companyName = application.jobId.companyId.name;

    await notificationService.createNotification({
      userId: candidateUser._id,
      type: 'APPLICATION_STATUS_UPDATE',
      title: `Application Status: ${newStatus}`,
      message: `Your application for ${jobTitle} at ${companyName} has moved to ${newStatus}.`,
      metadata: { applicationId: application._id, jobId: application.jobId._id, status: newStatus },
    });

    emailService.sendApplicationStatusEmail(
      candidateUser.email,
      candidateUser.name,
      jobTitle,
      companyName,
      newStatus
    );

    return application;
  },

  addNote: async (applicationId, userId, noteText) => {
    const application = await Application.findById(applicationId);
    if (!application) throw new ApiError(404, 'Application not found');

    application.recruiterNotes.push({
      authorId: userId,
      note: noteText,
      createdAt: new Date(),
    });

    await application.save();
    return application.recruiterNotes;
  },
};
