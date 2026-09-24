import { User } from '../auth/user.model.js';
import { Company } from '../companies/company.model.js';
import { Job } from '../jobs/job.model.js';
import { Application } from '../applications/application.model.js';
import { Interview } from '../interviews/interview.model.js';
import { AuditLog } from './auditLog.model.js';
import { getPagination, formatPaginationResponse } from '../../utils/pagination.js';
import { ROLES, JOB_STATUS, APPLICATION_STATUS } from '../../utils/constants.js';
import { ApiError } from '../../utils/ApiError.js';

export const adminService = {
  getPlatformStats: async () => {
    const [
      totalUsers,
      candidatesCount,
      recruitersCount,
      companiesCount,
      activeJobs,
      totalApplications,
      interviewsCount,
      hiresCount,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: ROLES.CANDIDATE }),
      User.countDocuments({ role: ROLES.RECRUITER }),
      Company.countDocuments(),
      Job.countDocuments({ status: JOB_STATUS.PUBLISHED }),
      Application.countDocuments(),
      Interview.countDocuments(),
      Application.countDocuments({ status: APPLICATION_STATUS.HIRED }),
    ]);

    // Pipeline funnel breakdown
    const funnelStages = await Application.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const funnel = {};
    Object.values(APPLICATION_STATUS).forEach((status) => {
      funnel[status] = 0;
    });
    funnelStages.forEach((stage) => {
      if (stage._id) funnel[stage._id] = stage.count;
    });

    return {
      overview: {
        totalUsers,
        candidatesCount,
        recruitersCount,
        companiesCount,
        activeJobs,
        totalApplications,
        interviewsCount,
        hiresCount,
      },
      funnel,
    };
  },

  getUsers: async (query) => {
    const { page, limit, skip } = getPagination(query);
    const filter = {};

    if (query.role) filter.role = query.role;
    if (query.search) {
      filter.$or = [
        { name: { $regex: query.search, $options: 'i' } },
        { email: { $regex: query.search, $options: 'i' } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(filter),
    ]);

    return formatPaginationResponse(users, total, page, limit);
  },

  toggleUserStatus: async (userId) => {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, 'User not found');

    if (user.role === ROLES.ADMIN) {
      throw new ApiError(400, 'Cannot deactivate platform administrator');
    }

    user.isActive = !user.isActive;
    await user.save();
    return user;
  },

  getCompanies: async (query) => {
    const { page, limit, skip } = getPagination(query);
    const filter = {};

    if (query.status) filter.verificationStatus = query.status;
    if (query.search) {
      filter.$or = [
        { name: { $regex: query.search, $options: 'i' } },
        { industry: { $regex: query.search, $options: 'i' } },
        { location: { $regex: query.search, $options: 'i' } },
      ];
    }

    const [companies, total] = await Promise.all([
      Company.find(filter)
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Company.countDocuments(filter),
    ]);

    return formatPaginationResponse(companies, total, page, limit);
  },

  getAuditLogs: async (query) => {
    const { page, limit, skip } = getPagination(query);
    const filter = {};

    if (query.action) filter.action = query.action;
    if (query.entity) filter.entity = query.entity;

    const [logs, total] = await Promise.all([
      AuditLog.find(filter)
        .populate('userId', 'name email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      AuditLog.countDocuments(filter),
    ]);

    return formatPaginationResponse(logs, total, page, limit);
  },

  moderateJob: async (jobId, action) => {
    const job = await Job.findById(jobId);
    if (!job) throw new ApiError(404, 'Job not found');

    if (action === 'CLOSE') {
      job.status = JOB_STATUS.CLOSED;
      await job.save();
    } else if (action === 'DELETE') {
      await Job.findByIdAndDelete(jobId);
    }
    return true;
  },
};
