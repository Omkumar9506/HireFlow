import { Router } from 'express';
import { applicationController } from './application.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { ROLES } from '../../utils/constants.js';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /applications/:id:
 *   get:
 *     summary: Get application details by ID
 *     tags: [Applications]
 */
router.get('/:id', applicationController.getApplicationById);

/**
 * @swagger
 * /applications/job/:jobId:
 *   get:
 *     summary: Get all applications for a specific job (ATS pipeline view)
 *     tags: [Applications]
 */
router.get('/job/:jobId', authorize(ROLES.RECRUITER, ROLES.ADMIN), applicationController.getJobApplications);

/**
 * @swagger
 * /applications/:id/status:
 *   patch:
 *     summary: Advance or update application ATS status
 *     tags: [Applications]
 */
router.patch('/:id/status', applicationController.updateStatus);

/**
 * @swagger
 * /applications/:id/shortlist:
 *   post:
 *     summary: Shortlist an application
 *     tags: [Applications]
 */
router.post('/:id/shortlist', authorize(ROLES.RECRUITER, ROLES.ADMIN), applicationController.shortlist);

/**
 * @swagger
 * /applications/:id/reject:
 *   post:
 *     summary: Reject an application
 *     tags: [Applications]
 */
router.post('/:id/reject', authorize(ROLES.RECRUITER, ROLES.ADMIN), applicationController.reject);

/**
 * @swagger
 * /applications/:id/withdraw:
 *   post:
 *     summary: Withdraw candidate application
 *     tags: [Applications]
 */
router.post('/:id/withdraw', authorize(ROLES.CANDIDATE), applicationController.withdraw);

/**
 * @swagger
 * /applications/:id/notes:
 *   post:
 *     summary: Add recruiter note to application
 *     tags: [Applications]
 */
router.post('/:id/notes', authorize(ROLES.RECRUITER, ROLES.ADMIN), applicationController.addNote);

export default router;
