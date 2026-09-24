import { companyService } from './company.service.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { auditService } from '../admin/audit.service.js';
import { COMPANY_STATUS } from '../../utils/constants.js';

export const companyController = {
  createCompany: async (req, res, next) => {
    try {
      const company = await companyService.createCompany(req.user._id, req.body);
      await auditService.logAction({
        userId: req.user._id,
        action: 'COMPANY_CREATED',
        entity: 'COMPANY',
        entityId: company._id,
        newValue: { name: company.name },
        req,
      });
      return res.status(201).json(new ApiResponse(201, company, 'Company profile created successfully'));
    } catch (error) {
      next(error);
    }
  },

  getMyCompany: async (req, res, next) => {
    try {
      const company = await companyService.getMyCompany(req.user._id);
      return res.status(200).json(new ApiResponse(200, company, 'My company profile'));
    } catch (error) {
      next(error);
    }
  },

  getCompanyById: async (req, res, next) => {
    try {
      const company = await companyService.getCompanyById(req.params.id);
      return res.status(200).json(new ApiResponse(200, company, 'Company details'));
    } catch (error) {
      next(error);
    }
  },

  getAllCompanies: async (req, res, next) => {
    try {
      const filter = { verificationStatus: COMPANY_STATUS.APPROVED };
      const companies = await companyService.getAllCompanies(filter);
      return res.status(200).json(new ApiResponse(200, companies, 'Approved companies list'));
    } catch (error) {
      next(error);
    }
  },

  updateCompany: async (req, res, next) => {
    try {
      const updated = await companyService.updateCompany(
        req.params.id,
        req.user._id,
        req.user.role,
        req.body
      );
      return res.status(200).json(new ApiResponse(200, updated, 'Company profile updated'));
    } catch (error) {
      next(error);
    }
  },

  verifyCompany: async (req, res, next) => {
    try {
      const { status, rejectionReason } = req.body;
      const updated = await companyService.verifyCompany(req.params.id, status, rejectionReason);
      await auditService.logAction({
        userId: req.user._id,
        action: 'COMPANY_VERIFICATION_UPDATED',
        entity: 'COMPANY',
        entityId: updated._id,
        newValue: { status, rejectionReason },
        req,
      });
      return res.status(200).json(new ApiResponse(200, updated, `Company status updated to ${status}`));
    } catch (error) {
      next(error);
    }
  },
};
