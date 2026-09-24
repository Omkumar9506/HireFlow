import { interviewService } from './interview.service.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { auditService } from '../admin/audit.service.js';

export const interviewController = {
  scheduleInterview: async (req, res, next) => {
    try {
      const interview = await interviewService.scheduleInterview(req.user._id, req.body);
      await auditService.logAction({
        userId: req.user._id,
        action: 'INTERVIEW_SCHEDULED',
        entity: 'INTERVIEW',
        entityId: interview._id,
        newValue: { scheduledAt: interview.scheduledAt, type: interview.type },
        req,
      });
      return res.status(201).json(new ApiResponse(201, interview, 'Interview scheduled successfully'));
    } catch (error) {
      next(error);
    }
  },

  getInterviews: async (req, res, next) => {
    try {
      const interviews = await interviewService.getInterviews(
        req.user._id,
        req.user.role,
        req.query
      );
      return res.status(200).json(new ApiResponse(200, interviews, 'Interviews list'));
    } catch (error) {
      next(error);
    }
  },

  getInterviewById: async (req, res, next) => {
    try {
      const interview = await interviewService.getInterviewById(
        req.params.id,
        req.user._id,
        req.user.role
      );
      return res.status(200).json(new ApiResponse(200, interview, 'Interview details'));
    } catch (error) {
      next(error);
    }
  },

  updateInterview: async (req, res, next) => {
    try {
      const updated = await interviewService.updateInterview(
        req.params.id,
        req.user._id,
        req.user.role,
        req.body
      );
      return res.status(200).json(new ApiResponse(200, updated, 'Interview updated'));
    } catch (error) {
      next(error);
    }
  },

  submitFeedback: async (req, res, next) => {
    try {
      const updated = await interviewService.submitFeedback(
        req.params.id,
        req.user._id,
        req.body
      );
      await auditService.logAction({
        userId: req.user._id,
        action: 'INTERVIEW_FEEDBACK_SUBMITTED',
        entity: 'INTERVIEW',
        entityId: updated._id,
        req,
      });
      return res.status(200).json(new ApiResponse(200, updated, 'Interview feedback submitted'));
    } catch (error) {
      next(error);
    }
  },
};
