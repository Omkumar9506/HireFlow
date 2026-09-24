import { Company } from './company.model.js';
import { Recruiter } from '../recruiters/recruiter.model.js';
import { ApiError } from '../../utils/ApiError.js';
import { COMPANY_STATUS, ROLES } from '../../utils/constants.js';
import { notificationService } from '../../services/notification.service.js';

export const companyService = {
  createCompany: async (userId, data) => {
    // Check if recruiter already has a company
    const recruiter = await Recruiter.findOne({ userId });
    if (!recruiter) {
      throw new ApiError(404, 'Recruiter profile not found');
    }

    const existingName = await Company.findOne({ name: data.name.trim() });
    if (existingName) {
      throw new ApiError(409, 'A company with this name already exists.');
    }

    const company = await Company.create({
      name: data.name.trim(),
      description: data.description || '',
      industry: data.industry,
      website: data.website || '',
      logo: data.logo || '',
      location: data.location,
      employeeCount: data.employeeCount || '1-10',
      foundedYear: data.foundedYear || null,
      createdBy: userId,
      verificationStatus: COMPANY_STATUS.PENDING,
    });

    recruiter.companyId = company._id;
    await recruiter.save();

    return company;
  },

  getCompanyById: async (id) => {
    const company = await Company.findById(id).populate('createdBy', 'name email');
    if (!company) {
      throw new ApiError(404, 'Company not found');
    }
    return company;
  },

  getMyCompany: async (userId) => {
    const recruiter = await Recruiter.findOne({ userId });
    if (!recruiter || !recruiter.companyId) {
      return null;
    }
    return await Company.findById(recruiter.companyId);
  },

  updateCompany: async (companyId, userId, userRole, data) => {
    const company = await Company.findById(companyId);
    if (!company) {
      throw new ApiError(404, 'Company not found');
    }

    if (userRole !== ROLES.ADMIN && company.createdBy.toString() !== userId.toString()) {
      throw new ApiError(403, 'You are not authorized to update this company');
    }

    const allowed = ['name', 'description', 'industry', 'website', 'logo', 'location', 'employeeCount', 'foundedYear'];
    for (const key of allowed) {
      if (data[key] !== undefined) {
        company[key] = data[key];
      }
    }

    await company.save();
    return company;
  },

  getAllCompanies: async (filter = {}) => {
    return await Company.find(filter).sort({ createdAt: -1 });
  },

  verifyCompany: async (companyId, status, rejectionReason = '') => {
    if (![COMPANY_STATUS.APPROVED, COMPANY_STATUS.REJECTED, COMPANY_STATUS.SUSPENDED].includes(status)) {
      throw new ApiError(400, 'Invalid verification status');
    }

    const company = await Company.findById(companyId);
    if (!company) {
      throw new ApiError(404, 'Company not found');
    }

    company.verificationStatus = status;
    if (rejectionReason) company.rejectionReason = rejectionReason;
    await company.save();

    // Send notification to company owner
    await notificationService.createNotification({
      userId: company.createdBy,
      type: 'COMPANY_VERIFICATION',
      title: `Company ${status === COMPANY_STATUS.APPROVED ? 'Approved' : 'Verification Update'}`,
      message: `Your company ${company.name} verification status is now ${status}. ${rejectionReason ? `Reason: ${rejectionReason}` : ''}`,
      metadata: { companyId: company._id, status },
    });

    return company;
  },
};
