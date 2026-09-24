import { Router } from 'express';
import { interviewController } from './interview.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { ROLES } from '../../utils/constants.js';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /interviews:
 *   post:
 *     summary: Schedule a new interview
 *     tags: [Interviews]
 */
router.post('/', authorize(ROLES.RECRUITER, ROLES.ADMIN), interviewController.scheduleInterview);

/**
 * @swagger
 * /interviews:
 *   get:
 *     summary: List interviews for logged in user (Candidate or Recruiter)
 *     tags: [Interviews]
 */
router.get('/', interviewController.getInterviews);

/**
 * @swagger
 * /interviews/:id:
 *   get:
 *     summary: Get single interview details
 *     tags: [Interviews]
 */
router.get('/:id', interviewController.getInterviewById);

/**
 * @swagger
 * /interviews/:id:
 *   patch:
 *     summary: Update or reschedule interview
 *     tags: [Interviews]
 */
router.patch('/:id', authorize(ROLES.RECRUITER, ROLES.ADMIN), interviewController.updateInterview);

/**
 * @swagger
 * /interviews/:id/feedback:
 *   post:
 *     summary: Submit recruiter evaluation rubric feedback
 *     tags: [Interviews]
 */
router.post('/:id/feedback', authorize(ROLES.RECRUITER, ROLES.ADMIN), interviewController.submitFeedback);

export default router;
