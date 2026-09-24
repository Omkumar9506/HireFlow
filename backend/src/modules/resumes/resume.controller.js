import { resumeService } from './resume.service.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { auditService } from '../admin/audit.service.js';

export const resumeController = {
  uploadResume: async (req, res, next) => {
    try {
      const isPrimary = req.body.isPrimary === 'true' || req.body.isPrimary === true;
      const resume = await resumeService.uploadAndParseResume(req.user._id, req.file, isPrimary);

      await auditService.logAction({
        userId: req.user._id,
        action: 'RESUME_UPLOADED',
        entity: 'RESUME',
        entityId: resume._id,
        newValue: { fileName: resume.fileName },
        req,
      });

      return res
        .status(201)
        .json(new ApiResponse(201, resume, 'Resume uploaded and analyzed successfully'));
    } catch (error) {
      next(error);
    }
  },

  setPrimary: async (req, res, next) => {
    try {
      const resume = await resumeService.setPrimaryResume(req.user._id, req.params.id);
      return res.status(200).json(new ApiResponse(200, resume, 'Primary resume updated'));
    } catch (error) {
      next(error);
    }
  },

  getResumeById: async (req, res, next) => {
    try {
      const resume = await resumeService.getResumeById(req.params.id);
      return res.status(200).json(new ApiResponse(200, resume, 'Resume details'));
    } catch (error) {
      next(error);
    }
  },
};
