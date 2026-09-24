import { Router } from 'express';
import { candidateController } from './candidate.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { ROLES } from '../../utils/constants.js';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /candidates/me:
 *   get:
 *     summary: Get logged-in candidate profile
 *     tags: [Candidates]
 */
router.get('/me', candidateController.getMyProfile);

/**
 * @swagger
 * /candidates/me:
 *   patch:
 *     summary: Update logged-in candidate profile
 *     tags: [Candidates]
 */
router.patch('/me', authorize(ROLES.CANDIDATE, ROLES.ADMIN), candidateController.updateMyProfile);

/**
 * @swagger
 * /candidates/applications:
 *   get:
 *     summary: Get all applications submitted by candidate
 *     tags: [Candidates]
 */
router.get('/applications', authorize(ROLES.CANDIDATE), candidateController.getMyApplications);

/**
 * @swagger
 * /candidates/saved-jobs:
 *   get:
 *     summary: Get saved jobs
 *     tags: [Candidates]
 */
router.get('/saved-jobs', authorize(ROLES.CANDIDATE), candidateController.getMySavedJobs);

/**
 * @swagger
 * /candidates/resumes:
 *   get:
 *     summary: Get candidate resumes
 *     tags: [Candidates]
 */
router.get('/resumes', authorize(ROLES.CANDIDATE), candidateController.getMyResumes);

/**
 * @swagger
 * /candidates/resumes/:id:
 *   delete:
 *     summary: Delete a candidate resume
 *     tags: [Candidates]
 */
router.delete('/resumes/:id', authorize(ROLES.CANDIDATE), candidateController.deleteResume);

export default router;
