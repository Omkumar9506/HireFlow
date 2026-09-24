import { Recruiter } from './recruiter.model.js';
import { Company } from '../companies/company.model.js';
import { User } from '../auth/user.model.js';
import { ApiError } from '../../utils/ApiError.js';

export const recruiterService = {
  getMyProfile: async (userId) => {
    let recruiter = await Recruiter.findOne({ userId })
      .populate('userId', 'name email role createdAt')
      .populate('companyId');

    if (!recruiter) {
      recruiter = await Recruiter.create({ userId });
      recruiter = await Recruiter.findById(recruiter._id)
        .populate('userId', 'name email role createdAt')
        .populate('companyId');
    }
    return recruiter;
  },

  updateMyProfile: async (userId, updateData) => {
    if (updateData.name) {
      await User.findByIdAndUpdate(userId, { name: updateData.name.trim() });
    }

    const allowed = ['designation', 'phone', 'companyId'];
    const safeUpdate = {};
    for (const key of allowed) {
      if (updateData[key] !== undefined) safeUpdate[key] = updateData[key];
    }

    const recruiter = await Recruiter.findOneAndUpdate(
      { userId },
      { $set: safeUpdate },
      { new: true, runValidators: true }
    )
      .populate('userId', 'name email role')
      .populate('companyId');

    if (!recruiter) {
      throw new ApiError(404, 'Recruiter profile not found');
    }

    return recruiter;
  },
};
