import { Router } from 'express';
import { resumeController } from './resume.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { uploadResume } from '../../middleware/upload.js';
import { ROLES } from '../../utils/constants.js';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /resumes/upload:
 *   post:
 *     summary: Upload and parse resume PDF/DOCX
 *     tags: [Resumes]
 */
router.post(
  '/upload',
  authorize(ROLES.CANDIDATE),
  uploadResume.single('resume'),
  resumeController.uploadResume
);

/**
 * @swagger
 * /resumes/:id/primary:
 *   patch:
 *     summary: Set a resume as primary
 *     tags: [Resumes]
 */
router.patch('/:id/primary', authorize(ROLES.CANDIDATE), resumeController.setPrimary);

/**
 * @swagger
 * /resumes/:id:
 *   get:
 *     summary: Get resume details
 *     tags: [Resumes]
 */
router.get('/:id', resumeController.getResumeById);

export default router;
