import { Router } from 'express';
import { notificationController } from './notification.controller.js';
import { authenticate } from '../../middleware/authenticate.js';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: Get notifications and unread count for current user
 *     tags: [Notifications]
 */
router.get('/', notificationController.getMyNotifications);

/**
 * @swagger
 * /notifications/:id/read:
 *   patch:
 *     summary: Mark single notification as read
 *     tags: [Notifications]
 */
router.patch('/:id/read', notificationController.markAsRead);

/**
 * @swagger
 * /notifications/read-all:
 *   patch:
 *     summary: Mark all notifications as read
 *     tags: [Notifications]
 */
router.patch('/read-all', notificationController.markAllAsRead);

export default router;
