import { candidateService } from './candidate.service.js';
import { ApiResponse } from '../../utils/ApiResponse.js';

export const candidateController = {
  getMyProfile: async (req, res, next) => {
    try {
      const candidate = await candidateService.getMyProfile(req.user._id);
      return res.status(200).json(new ApiResponse(200, candidate, 'Candidate profile retrieved'));
    } catch (error) {
      next(error);
    }
  },

  updateMyProfile: async (req, res, next) => {
    try {
      const updated = await candidateService.updateMyProfile(req.user._id, req.body);
      return res.status(200).json(new ApiResponse(200, updated, 'Profile updated successfully'));
    } catch (error) {
      next(error);
    }
  },

  getMyApplications: async (req, res, next) => {
    try {
      const applications = await candidateService.getMyApplications(req.user._id);
      return res.status(200).json(new ApiResponse(200, applications, 'Candidate applications retrieved'));
    } catch (error) {
      next(error);
    }
  },

  getMySavedJobs: async (req, res, next) => {
    try {
      const jobs = await candidateService.getMySavedJobs(req.user._id);
      return res.status(200).json(new ApiResponse(200, jobs, 'Saved jobs retrieved'));
    } catch (error) {
      next(error);
    }
  },

  getMyResumes: async (req, res, next) => {
    try {
      const resumes = await candidateService.getMyResumes(req.user._id);
      return res.status(200).json(new ApiResponse(200, resumes, 'Candidate resumes retrieved'));
    } catch (error) {
      next(error);
    }
  },

  deleteResume: async (req, res, next) => {
    try {
      await candidateService.deleteResume(req.user._id, req.params.id);
      return res.status(200).json(new ApiResponse(200, null, 'Resume deleted successfully'));
    } catch (error) {
      next(error);
    }
  },
};
