import { jobService } from './job.service.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { auditService } from '../admin/audit.service.js';

export const jobController = {
  createJob: async (req, res, next) => {
    try {
      const job = await jobService.createJob(req.user._id, req.body);
      await auditService.logAction({
        userId: req.user._id,
        action: 'JOB_CREATED',
        entity: 'JOB',
        entityId: job._id,
        newValue: { title: job.title, status: job.status },
        req,
      });
      return res.status(201).json(new ApiResponse(201, job, 'Job created successfully'));
    } catch (error) {
      next(error);
    }
  },

  searchJobs: async (req, res, next) => {
    try {
      const result = await jobService.searchJobs(req.query);
      return res.status(200).json(new ApiResponse(200, result, 'Jobs fetched'));
    } catch (error) {
      next(error);
    }
  },

  getJobById: async (req, res, next) => {
    try {
      const currentUserId = req.user ? req.user._id : null;
      const job = await jobService.getJobById(req.params.id, currentUserId);
      return res.status(200).json(new ApiResponse(200, job, 'Job details'));
    } catch (error) {
      next(error);
    }
  },

  getRecruiterJobs: async (req, res, next) => {
    try {
      const result = await jobService.getRecruiterJobs(req.user._id, req.query);
      return res.status(200).json(new ApiResponse(200, result, 'Recruiter jobs list'));
    } catch (error) {
      next(error);
    }
  },

  updateJob: async (req, res, next) => {
    try {
      const updated = await jobService.updateJob(req.params.id, req.user._id, req.user.role, req.body);
      return res.status(200).json(new ApiResponse(200, updated, 'Job updated successfully'));
    } catch (error) {
      next(error);
    }
  },

  publishJob: async (req, res, next) => {
    try {
      const published = await jobService.publishJob(req.params.id, req.user._id, req.user.role);
      await auditService.logAction({
        userId: req.user._id,
        action: 'JOB_PUBLISHED',
        entity: 'JOB',
        entityId: published._id,
        req,
      });
      return res.status(200).json(new ApiResponse(200, published, 'Job published successfully'));
    } catch (error) {
      next(error);
    }
  },

  closeJob: async (req, res, next) => {
    try {
      const closed = await jobService.closeJob(req.params.id, req.user._id, req.user.role);
      await auditService.logAction({
        userId: req.user._id,
        action: 'JOB_CLOSED',
        entity: 'JOB',
        entityId: closed._id,
        req,
      });
      return res.status(200).json(new ApiResponse(200, closed, 'Job closed successfully'));
    } catch (error) {
      next(error);
    }
  },

  saveJob: async (req, res, next) => {
    try {
      const result = await jobService.saveJob(req.params.id, req.user._id);
      return res.status(200).json(new ApiResponse(200, result, result.message));
    } catch (error) {
      next(error);
    }
  },

  unsaveJob: async (req, res, next) => {
    try {
      const result = await jobService.unsaveJob(req.params.id, req.user._id);
      return res.status(200).json(new ApiResponse(200, result, result.message));
    } catch (error) {
      next(error);
    }
  },

  applyForJob: async (req, res, next) => {
    try {
      const application = await jobService.applyForJob(req.params.id, req.user._id, req.body);
      await auditService.logAction({
        userId: req.user._id,
        action: 'APPLICATION_CREATED',
        entity: 'APPLICATION',
        entityId: application._id,
        newValue: { jobId: req.params.id },
        req,
      });
      return res.status(201).json(new ApiResponse(201, application, 'Application submitted successfully!'));
    } catch (error) {
      next(error);
    }
  },
};
