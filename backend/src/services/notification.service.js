import { Notification } from '../modules/notifications/notification.model.js';
import { logger } from '../utils/logger.js';

export const notificationService = {
  createNotification: async ({ userId, type, title, message, metadata = {} }) => {
    try {
      const notification = await Notification.create({
        userId,
        type,
        title,
        message,
        metadata,
      });
      return notification;
    } catch (error) {
      logger.error('Failed to create in-app notification:', error.message);
      return null;
    }
  },

  getUnreadCount: async (userId) => {
    return await Notification.countDocuments({ userId, isRead: false });
  },
};
