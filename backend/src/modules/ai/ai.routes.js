import { Router } from 'express';
import { aiController } from './ai.controller.js';
import { authenticate } from '../../middleware/authenticate.js';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /ai/resume/analyze:
 *   post:
 *     summary: AI Resume analysis
 *     tags: [AI]
 */
router.post('/resume/analyze', aiController.analyzeResume);

/**
 * @swagger
 * /ai/job/analyze:
 *   post:
 *     summary: AI Job description breakdown & skill extraction
 *     tags: [AI]
 */
router.post('/job/analyze', aiController.analyzeJob);

/**
 * @swagger
 * /ai/job/:jobId/match:
 *   post:
 *     summary: AI Match between candidate resume and job posting
 *     tags: [AI]
 */
router.post('/job/:jobId/match', aiController.matchJob);

/**
 * @swagger
 * /ai/interview/questions:
 *   post:
 *     summary: Generate tailored interview questions
 *     tags: [AI]
 */
router.post('/interview/questions', aiController.generateQuestions);

export default router;
