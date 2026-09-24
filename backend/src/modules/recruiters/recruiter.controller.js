import { recruiterService } from './recruiter.service.js';
import { ApiResponse } from '../../utils/ApiResponse.js';

export const recruiterController = {
  getMyProfile: async (req, res, next) => {
    try {
      const profile = await recruiterService.getMyProfile(req.user._id);
      return res.status(200).json(new ApiResponse(200, profile, 'Recruiter profile retrieved'));
    } catch (error) {
      next(error);
    }
  },

  updateMyProfile: async (req, res, next) => {
    try {
      const updated = await recruiterService.updateMyProfile(req.user._id, req.body);
      return res.status(200).json(new ApiResponse(200, updated, 'Profile updated successfully'));
    } catch (error) {
      next(error);
    }
  },
};
