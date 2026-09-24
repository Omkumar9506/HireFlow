import { aiService } from '../../services/ai.service.js';
import { Job } from '../jobs/job.model.js';
import { Resume } from '../resumes/resume.model.js';
import { Candidate } from '../candidates/candidate.model.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { ApiError } from '../../utils/ApiError.js';

export const aiController = {
  analyzeResume: async (req, res, next) => {
    try {
      const { text, resumeId } = req.body;
      let resumeText = text;

      if (!resumeText && resumeId) {
        const resume = await Resume.findById(resumeId);
        if (resume) resumeText = resume.extractedText;
      }

      if (!resumeText) {
        throw new ApiError(400, 'Resume text or valid resumeId is required');
      }

      const analysis = await aiService.analyzeResume(resumeText);
      return res.status(200).json(new ApiResponse(200, analysis, 'Resume analyzed successfully'));
    } catch (error) {
      next(error);
    }
  },

  analyzeJob: async (req, res, next) => {
    try {
      const { title, description } = req.body;
      if (!title || !description) {
        throw new ApiError(400, 'Job title and description are required');
      }

      const analysis = await aiService.analyzeJob(title, description);
      return res.status(200).json(new ApiResponse(200, analysis, 'Job posting analyzed successfully'));
    } catch (error) {
      next(error);
    }
  },

  matchJob: async (req, res, next) => {
    try {
      const { jobId } = req.params;
      const job = await Job.findById(jobId);
      if (!job) throw new ApiError(404, 'Job not found');

      const candidate = await Candidate.findOne({ userId: req.user._id }).populate('resumeId');
      if (!candidate) throw new ApiError(404, 'Candidate profile not found');

      let resumeText = '';
      if (candidate.resumeId) {
        resumeText = candidate.resumeId.extractedText || '';
      }

      const match = await aiService.matchJobWithResume(
        resumeText,
        candidate.skills || [],
        job
      );

      return res.status(200).json(new ApiResponse(200, match, 'AI Job match analysis completed'));
    } catch (error) {
      next(error);
    }
  },

  generateQuestions: async (req, res, next) => {
    try {
      const { jobTitle, skills, experienceLevel } = req.body;
      if (!jobTitle) throw new ApiError(400, 'Job title is required');

      const questions = await aiService.generateInterviewQuestions(
        jobTitle,
        skills || [],
        experienceLevel || 'Mid-Level'
      );

      return res.status(200).json(new ApiResponse(200, questions, 'Interview questions generated'));
    } catch (error) {
      next(error);
    }
  },
};
