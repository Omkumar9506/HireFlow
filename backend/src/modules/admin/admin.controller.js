import { adminService } from './admin.service.js';
import { companyService } from '../companies/company.service.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { auditService } from './audit.service.js';

export const adminController = {
  getStats: async (req, res, next) => {
    try {
      const stats = await adminService.getPlatformStats();
      return res.status(200).json(new ApiResponse(200, stats, 'Platform analytics retrieved'));
    } catch (error) {
      next(error);
    }
  },

  getUsers: async (req, res, next) => {
    try {
      const users = await adminService.getUsers(req.query);
      return res.status(200).json(new ApiResponse(200, users, 'Users retrieved'));
    } catch (error) {
      next(error);
    }
  },

  toggleUserStatus: async (req, res, next) => {
    try {
      const user = await adminService.toggleUserStatus(req.params.id);
      await auditService.logAction({
        userId: req.user._id,
        action: 'USER_STATUS_TOGGLED',
        entity: 'USER',
        entityId: user._id,
        newValue: { isActive: user.isActive },
        req,
      });
      return res
        .status(200)
        .json(new ApiResponse(200, user, `User account is now ${user.isActive ? 'active' : 'deactivated'}`));
    } catch (error) {
      next(error);
    }
  },

  getCompanies: async (req, res, next) => {
    try {
      const companies = await adminService.getCompanies(req.query);
      return res.status(200).json(new ApiResponse(200, companies, 'Companies retrieved'));
    } catch (error) {
      next(error);
    }
  },

  getAuditLogs: async (req, res, next) => {
    try {
      const logs = await adminService.getAuditLogs(req.query);
      return res.status(200).json(new ApiResponse(200, logs, 'Audit logs retrieved'));
    } catch (error) {
      next(error);
    }
  },

  moderateJob: async (req, res, next) => {
    try {
      const { action } = req.body; // CLOSE or DELETE
      await adminService.moderateJob(req.params.id, action);
      await auditService.logAction({
        userId: req.user._id,
        action: `JOB_MODERATED_${action}`,
        entity: 'JOB',
        entityId: req.params.id,
        req,
      });
      return res.status(200).json(new ApiResponse(200, null, `Job successfully moderated (${action})`));
    } catch (error) {
      next(error);
    }
  },

  verifyCompany: async (req, res, next) => {
    try {
      const { status, rejectionReason } = req.body;
      const company = await companyService.verifyCompany(req.params.id, status, rejectionReason);
      await auditService.logAction({
        userId: req.user._id,
        action: `COMPANY_VERIFICATION_${status}`,
        entity: 'COMPANY',
        entityId: company._id,
        newValue: { status, rejectionReason },
        req,
      });
      return res.status(200).json(new ApiResponse(200, company, `Company verification status updated to ${status}`));
    } catch (error) {
      next(error);
    }
  },
};
