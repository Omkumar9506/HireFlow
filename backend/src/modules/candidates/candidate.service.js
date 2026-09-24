import { Candidate } from './candidate.model.js';
import { User } from '../auth/user.model.js';
import { Resume } from '../resumes/resume.model.js';
import { Application } from '../applications/application.model.js';
import { SavedJob } from '../jobs/savedJob.model.js';
import { ApiError } from '../../utils/ApiError.js';

export const candidateService = {
  getMyProfile: async (userId) => {
    let candidate = await Candidate.findOne({ userId })
      .populate('userId', 'name email role isEmailVerified createdAt')
      .populate('resumeId');

    if (!candidate) {
      candidate = await Candidate.create({ userId });
      candidate = await Candidate.findById(candidate._id)
        .populate('userId', 'name email role isEmailVerified createdAt')
        .populate('resumeId');
    }
    return candidate;
  },

  updateMyProfile: async (userId, updateData) => {
    // If name is passed in updateData, update the associated User record as well
    if (updateData.name) {
      await User.findByIdAndUpdate(userId, { name: updateData.name.trim() });
    }

    const allowedFields = [
      'phone',
      'location',
      'headline',
      'bio',
      'experience',
      'education',
      'skills',
      'profilePicture',
      'linkedinUrl',
      'githubUrl',
      'portfolioUrl',
    ];

    const safeUpdate = {};
    for (const key of allowedFields) {
      if (updateData[key] !== undefined) {
        safeUpdate[key] = updateData[key];
      }
    }

    const candidate = await Candidate.findOneAndUpdate(
      { userId },
      { $set: safeUpdate },
      { new: true, runValidators: true }
    )
      .populate('userId', 'name email role isEmailVerified')
      .populate('resumeId');

    if (!candidate) {
      throw new ApiError(404, 'Candidate profile not found.');
    }

    return candidate;
  },

  getMyApplications: async (userId) => {
    const candidate = await Candidate.findOne({ userId });
    if (!candidate) {
      return [];
    }

    return await Application.find({ candidateId: candidate._id })
      .populate({
        path: 'jobId',
        select: 'title location workMode employmentType salary status companyId openings createdAt',
        populate: { path: 'companyId', select: 'name logo location verificationStatus' },
      })
      .populate('resumeId', 'fileName fileUrl')
      .sort({ appliedAt: -1 });
  },

  getMySavedJobs: async (userId) => {
    const candidate = await Candidate.findOne({ userId });
    if (!candidate) return [];

    const saved = await SavedJob.find({ candidateId: candidate._id })
      .populate({
        path: 'jobId',
        populate: { path: 'companyId', select: 'name logo location' },
      })
      .sort({ createdAt: -1 });

    return saved.map((s) => s.jobId).filter(Boolean);
  },

  getMyResumes: async (userId) => {
    const candidate = await Candidate.findOne({ userId });
    if (!candidate) return [];

    return await Resume.find({ candidateId: candidate._id }).sort({ createdAt: -1 });
  },

  deleteResume: async (userId, resumeId) => {
    const candidate = await Candidate.findOne({ userId });
    if (!candidate) throw new ApiError(404, 'Candidate not found');

    const resume = await Resume.findOne({ _id: resumeId, candidateId: candidate._id });
    if (!resume) throw new ApiError(404, 'Resume not found');

    await Resume.deleteOne({ _id: resumeId });

    if (candidate.resumeId?.toString() === resumeId.toString()) {
      candidate.resumeId = null;
      await candidate.save();
    }
    return true;
  },
};
