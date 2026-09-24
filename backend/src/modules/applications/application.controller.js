import { applicationService } from './application.service.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { auditService } from '../admin/audit.service.js';
import { APPLICATION_STATUS } from '../../utils/constants.js';

export const applicationController = {
  getApplicationById: async (req, res, next) => {
    try {
      const application = await applicationService.getApplicationById(
        req.params.id,
        req.user._id,
        req.user.role
      );
      return res.status(200).json(new ApiResponse(200, application, 'Application details'));
    } catch (error) {
      next(error);
    }
  },

  getJobApplications: async (req, res, next) => {
    try {
      const applications = await applicationService.getJobApplications(
        req.params.jobId,
        req.user._id,
        req.user.role,
        req.query
      );
      return res.status(200).json(new ApiResponse(200, applications, 'Job applications'));
    } catch (error) {
      next(error);
    }
  },

  updateStatus: async (req, res, next) => {
    try {
      const { status, reason } = req.body;
      const updated = await applicationService.updateStatus(
        req.params.id,
        req.user._id,
        req.user.role,
        status,
        reason
      );

      await auditService.logAction({
        userId: req.user._id,
        action: 'APPLICATION_STATUS_CHANGED',
        entity: 'APPLICATION',
        entityId: req.params.id,
        newValue: { status, reason },
        req,
      });

      return res
        .status(200)
        .json(new ApiResponse(200, updated, `Application status updated to ${status}`));
    } catch (error) {
      next(error);
    }
  },

  shortlist: async (req, res, next) => {
    try {
      const updated = await applicationService.updateStatus(
        req.params.id,
        req.user._id,
        req.user.role,
        APPLICATION_STATUS.SHORTLISTED,
        req.body?.reason || 'Candidate shortlisted for interview'
      );
      return res.status(200).json(new ApiResponse(200, updated, 'Candidate shortlisted successfully'));
    } catch (error) {
      next(error);
    }
  },

  reject: async (req, res, next) => {
    try {
      const updated = await applicationService.updateStatus(
        req.params.id,
        req.user._id,
        req.user.role,
        APPLICATION_STATUS.REJECTED,
        req.body?.reason || 'Application not progressing further'
      );
      return res.status(200).json(new ApiResponse(200, updated, 'Application marked as rejected'));
    } catch (error) {
      next(error);
    }
  },

  withdraw: async (req, res, next) => {
    try {
      const updated = await applicationService.updateStatus(
        req.params.id,
        req.user._id,
        req.user.role,
        APPLICATION_STATUS.WITHDRAWN,
        req.body?.reason || 'Candidate withdrew application'
      );
      return res.status(200).json(new ApiResponse(200, updated, 'Application withdrawn successfully'));
    } catch (error) {
      next(error);
    }
  },

  addNote: async (req, res, next) => {
    try {
      const notes = await applicationService.addNote(req.params.id, req.user._id, req.body.note);
      return res.status(200).json(new ApiResponse(200, notes, 'Note added to application'));
    } catch (error) {
      next(error);
    }
  },
};
