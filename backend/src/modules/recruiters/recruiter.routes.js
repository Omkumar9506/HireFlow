import { Router } from 'express';
import { recruiterController } from './recruiter.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { ROLES } from '../../utils/constants.js';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /recruiters/me:
 *   get:
 *     summary: Get logged-in recruiter profile
 *     tags: [Recruiters]
 */
router.get('/me', authorize(ROLES.RECRUITER, ROLES.ADMIN), recruiterController.getMyProfile);

/**
 * @swagger
 * /recruiters/me:
 *   patch:
 *     summary: Update logged-in recruiter profile
 *     tags: [Recruiters]
 */
router.patch('/me', authorize(ROLES.RECRUITER, ROLES.ADMIN), recruiterController.updateMyProfile);

export default router;
