import { Router } from 'express';
import { authController } from './auth.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { validate } from '../../middleware/validate.js';
import { validateRegister, validateLogin, validateSendOtp } from './auth.validation.js';
import { authLimiter } from '../../middleware/rateLimiter.js';

const router = Router();

/**
 * @swagger
 * /auth/send-otp:
 *   post:
 *     summary: Send 6-digit verification code to email for account registration
 *     tags: [Auth]
 */
router.post('/send-otp', authLimiter, validate(validateSendOtp), authController.sendOtp);

/**
 * @swagger
 * /auth/verify-otp:
 *   post:
 *     summary: Verify 6-digit verification code
 *     tags: [Auth]
 */
router.post('/verify-otp', authLimiter, authController.verifyOtp);

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user (Candidate or Recruiter)
 *     tags: [Auth]
 */
router.post('/register', authLimiter, validate(validateRegister), authController.register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: User login
 *     tags: [Auth]
 */
router.post('/login', authLimiter, validate(validateLogin), authController.login);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refresh access token using refresh token cookie
 *     tags: [Auth]
 */
router.post('/refresh', authController.refresh);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout and revoke refresh token
 *     tags: [Auth]
 */
router.post('/logout', authController.logout);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current authenticated user profile
 *     tags: [Auth]
 */
router.get('/me', authenticate, authController.getMe);

/**
 * @swagger
 * /auth/verify-email:
 *   post:
 *     summary: Verify email address
 *     tags: [Auth]
 */
router.post('/verify-email', authController.verifyEmail);

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Request password reset link
 *     tags: [Auth]
 */
router.post('/forgot-password', authLimiter, authController.forgotPassword);

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Reset password with token
 *     tags: [Auth]
 */
router.post('/reset-password', authLimiter, authController.resetPassword);

export default router;
