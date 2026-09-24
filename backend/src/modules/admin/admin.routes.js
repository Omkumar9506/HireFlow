import { Router } from 'express';
import { adminController } from './admin.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { ROLES } from '../../utils/constants.js';

const router = Router();

router.use(authenticate);
router.use(authorize(ROLES.ADMIN));

/**
 * @swagger
 * /admin/stats:
 *   get:
 *     summary: Get overall platform analytics and funnel stats
 *     tags: [Admin]
 */
router.get('/stats', adminController.getStats);

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: List platform users with search and pagination
 *     tags: [Admin]
 */
router.get('/users', adminController.getUsers);

/**
 * @swagger
 * /admin/users/:id/toggle-status:
 *   patch:
 *     summary: Activate or deactivate a user account
 *     tags: [Admin]
 */
router.patch('/users/:id/toggle-status', adminController.toggleUserStatus);

/**
 * @swagger
 * /admin/companies:
 *   get:
 *     summary: List all companies (pending, approved, rejected)
 *     tags: [Admin]
 */
router.get('/companies', adminController.getCompanies);

/**
 * @swagger
 * /admin/audit-logs:
 *   get:
 *     summary: View system audit trail
 *     tags: [Admin]
 */
router.get('/audit-logs', adminController.getAuditLogs);

/**
 * @swagger
 * /admin/jobs/:id/moderate:
 *   post:
 *     summary: Moderate (close or remove) inappropriate job listing
 *     tags: [Admin]
 */
router.post('/jobs/:id/moderate', adminController.moderateJob);

export default router;
