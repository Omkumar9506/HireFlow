import { Job } from './job.model.js';
import { Company } from '../companies/company.model.js';
import { Recruiter } from '../recruiters/recruiter.model.js';
import { Candidate } from '../candidates/candidate.model.js';
import { Application } from '../applications/application.model.js';
import { SavedJob } from './savedJob.model.js';
import { Resume } from '../resumes/resume.model.js';
import { ApiError } from '../../utils/ApiError.js';
import {
  JOB_STATUS,
  COMPANY_STATUS,
  ROLES,
  APPLICATION_STATUS,
} from '../../utils/constants.js';
import { getPagination, formatPaginationResponse } from '../../utils/pagination.js';
import { aiService } from '../../services/ai.service.js';
import { notificationService } from '../../services/notification.service.js';
import { emailService } from '../../services/email.service.js';

export const jobService = {
  createJob: async (userId, data) => {
    const recruiter = await Recruiter.findOne({ userId });
    if (!recruiter || !recruiter.companyId) {
      throw new ApiError(400, 'You must register or belong to a company before posting a job.');
    }

    const company = await Company.findById(recruiter.companyId);
    if (!company) {
      throw new ApiError(404, 'Associated company not found.');
    }

    // If publishing immediately, check company verification
    if (data.status === JOB_STATUS.PUBLISHED && company.verificationStatus !== COMPANY_STATUS.APPROVED) {
      throw new ApiError(
        403,
        'Your company must be verified and approved by an administrator before publishing live jobs. You may save this as a draft.'
      );
    }

    const job = await Job.create({
      ...data,
      companyId: company._id,
      recruiterId: userId,
    });

    return job;
  },

  getJobById: async (jobId, currentUserId = null) => {
    const job = await Job.findById(jobId)
      .populate('companyId', 'name description logo website location employeeCount verificationStatus')
      .populate('recruiterId', 'name email');

    if (!job) {
      throw new ApiError(404, 'Job not found');
    }

    let isSaved = false;
    let hasApplied = false;

    if (currentUserId) {
      const candidate = await Candidate.findOne({ userId: currentUserId });
      if (candidate) {
        const savedDoc = await SavedJob.findOne({ candidateId: candidate._id, jobId });
        isSaved = Boolean(savedDoc);

        const applicationDoc = await Application.findOne({ candidateId: candidate._id, jobId });
        hasApplied = Boolean(applicationDoc);
      }
    }

    return {
      ...job.toObject(),
      isSaved,
      hasApplied,
    };
  },

  searchJobs: async (query) => {
    const { page, limit, skip } = getPagination(query);

    const filter = {
      status: JOB_STATUS.PUBLISHED,
    };

    if (query.search) {
      filter.$or = [
        { title: { $regex: query.search, $options: 'i' } },
        { description: { $regex: query.search, $options: 'i' } },
        { skills: { $in: [new RegExp(query.search, 'i')] } },
      ];
    }

    if (query.location) {
      filter.location = { $regex: query.location, $options: 'i' };
    }

    if (query.workMode) {
      filter.workMode = query.workMode;
    }

    if (query.employmentType) {
      filter.employmentType = query.employmentType;
    }

    if (query.experience) {
      const exp = parseInt(query.experience, 10);
      filter['experience.min'] = { $lte: exp };
      filter['experience.max'] = { $gte: exp };
    }

    if (query.minSalary) {
      filter['salary.min'] = { $gte: parseInt(query.minSalary, 10) };
    }

    if (query.companyId) {
      filter.companyId = query.companyId;
    }

    const sortOptions = {};
    if (query.sort === 'salary_desc') {
      sortOptions['salary.max'] = -1;
    } else if (query.sort === 'oldest') {
      sortOptions.createdAt = 1;
    } else {
      sortOptions.createdAt = -1; // Default newest
    }

    const [jobs, total] = await Promise.all([
      Job.find(filter)
        .populate('companyId', 'name logo location verificationStatus')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit),
      Job.countDocuments(filter),
    ]);

    return formatPaginationResponse(jobs, total, page, limit);
  },

  getRecruiterJobs: async (userId, query = {}) => {
    const { page, limit, skip } = getPagination(query);

    const filter = { recruiterId: userId };
    if (query.status) {
      filter.status = query.status;
    }

    const [jobs, total] = await Promise.all([
      Job.find(filter)
        .populate('companyId', 'name logo')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Job.countDocuments(filter),
    ]);

    // Attach application counts for each job
    const jobsWithCounts = await Promise.all(
      jobs.map(async (job) => {
        const applicationCount = await Application.countDocuments({ jobId: job._id });
        return {
          ...job.toObject(),
          applicationCount,
        };
      })
    );

    return formatPaginationResponse(jobsWithCounts, total, page, limit);
  },

  updateJob: async (jobId, userId, userRole, data) => {
    const job = await Job.findById(jobId);
    if (!job) {
      throw new ApiError(404, 'Job not found');
    }

    if (userRole !== ROLES.ADMIN && job.recruiterId.toString() !== userId.toString()) {
      throw new ApiError(403, 'You are not authorized to update this job');
    }

    // If publishing, check company verification
    if (data.status === JOB_STATUS.PUBLISHED && job.status !== JOB_STATUS.PUBLISHED) {
      const company = await Company.findById(job.companyId);
      if (company.verificationStatus !== COMPANY_STATUS.APPROVED) {
        throw new ApiError(403, 'Company must be approved before publishing jobs.');
      }
    }

    Object.assign(job, data);
    await job.save();
    return job;
  },

  publishJob: async (jobId, userId, userRole) => {
    const job = await Job.findById(jobId);
    if (!job) throw new ApiError(404, 'Job not found');

    if (userRole !== ROLES.ADMIN && job.recruiterId.toString() !== userId.toString()) {
      throw new ApiError(403, 'Unauthorized');
    }

    const company = await Company.findById(job.companyId);
    if (company.verificationStatus !== COMPANY_STATUS.APPROVED) {
      throw new ApiError(403, 'Only approved companies can publish jobs.');
    }

    job.status = JOB_STATUS.PUBLISHED;
    await job.save();
    return job;
  },

  closeJob: async (jobId, userId, userRole) => {
    const job = await Job.findById(jobId);
    if (!job) throw new ApiError(404, 'Job not found');

    if (userRole !== ROLES.ADMIN && job.recruiterId.toString() !== userId.toString()) {
      throw new ApiError(403, 'Unauthorized');
    }

    job.status = JOB_STATUS.CLOSED;
    await job.save();
    return job;
  },

  saveJob: async (jobId, userId) => {
    const candidate = await Candidate.findOne({ userId });
    if (!candidate) throw new ApiError(404, 'Candidate profile not found');

    const job = await Job.findById(jobId);
    if (!job) throw new ApiError(404, 'Job not found');

    const existing = await SavedJob.findOne({ candidateId: candidate._id, jobId });
    if (existing) {
      return { saved: true, message: 'Job already saved' };
    }

    await SavedJob.create({ candidateId: candidate._id, jobId });
    return { saved: true, message: 'Job saved successfully' };
  },

  unsaveJob: async (jobId, userId) => {
    const candidate = await Candidate.findOne({ userId });
    if (!candidate) throw new ApiError(404, 'Candidate not found');

    await SavedJob.findOneAndDelete({ candidateId: candidate._id, jobId });
    return { saved: false, message: 'Job removed from saved' };
  },

  applyForJob: async (jobId, userId, { resumeId, coverLetter }) => {
    const candidate = await Candidate.findOne({ userId }).populate('userId', 'name email');
    if (!candidate) throw new ApiError(404, 'Candidate profile not found');

    const job = await Job.findById(jobId).populate('companyId', 'name');
    if (!job) throw new ApiError(404, 'Job not found');

    // Rule: Cannot apply to closed or draft jobs
    if (job.status !== JOB_STATUS.PUBLISHED) {
      throw new ApiError(400, 'This job is not accepting applications at this time.');
    }

    // Rule: Cannot apply after deadline
    if (job.applicationDeadline && new Date() > new Date(job.applicationDeadline)) {
      throw new ApiError(400, 'The application deadline for this position has passed.');
    }

    // Rule: Cannot apply twice to same job
    const existing = await Application.findOne({ jobId, candidateId: candidate._id });
    if (existing) {
      throw new ApiError(409, 'You have already applied for this job.');
    }

    // Validate resume
    let finalResumeId = resumeId || candidate.resumeId;
    if (!finalResumeId) {
      // Find latest candidate resume
      const latestResume = await Resume.findOne({ candidateId: candidate._id }).sort({ createdAt: -1 });
      if (!latestResume) {
        throw new ApiError(400, 'Please upload a resume before applying.');
      }
      finalResumeId = latestResume._id;
    }

    const resumeDoc = await Resume.findById(finalResumeId);
    if (!resumeDoc) throw new ApiError(404, 'Selected resume not found');

    // Perform AI Job Match
    const matchAnalysis = await aiService.matchJobWithResume(
      resumeDoc.extractedText || '',
      candidate.skills || [],
      job
    );

    const application = await Application.create({
      jobId,
      candidateId: candidate._id,
      resumeId: finalResumeId,
      status: APPLICATION_STATUS.APPLIED,
      coverLetter: coverLetter || '',
      matchScore: matchAnalysis.matchScore,
      matchAnalysis,
      statusHistory: [
        {
          fromStatus: null,
          toStatus: APPLICATION_STATUS.APPLIED,
          changedBy: userId,
          reason: 'Initial application submitted',
          changedAt: new Date(),
        },
      ],
    });

    // Notify Recruiter
    await notificationService.createNotification({
      userId: job.recruiterId,
      type: 'NEW_APPLICATION',
      title: `New Candidate: ${job.title}`,
      message: `${candidate.userId?.name || 'A candidate'} has applied for ${job.title} (Match: ${matchAnalysis.matchScore}%).`,
      metadata: { applicationId: application._id, jobId: job._id },
    });

    // Send confirmation email to Candidate
    emailService.sendApplicationStatusEmail(
      candidate.userId.email,
      candidate.userId.name,
      job.title,
      job.companyId.name,
      'APPLIED (Under Review)'
    );

    return application;
  },
};
