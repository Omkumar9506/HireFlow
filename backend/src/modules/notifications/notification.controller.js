import { Notification } from './notification.model.js';
import { ApiResponse } from '../../utils/ApiResponse.js';

export const notificationController = {
  getMyNotifications: async (req, res, next) => {
    try {
      const [notifications, unreadCount] = await Promise.all([
        Notification.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(50),
        Notification.countDocuments({ userId: req.user._id, isRead: false }),
      ]);
      return res.status(200).json(
        new ApiResponse(200, { notifications, unreadCount }, 'Notifications retrieved')
      );
    } catch (error) {
      next(error);
    }
  },

  markAsRead: async (req, res, next) => {
    try {
      await Notification.findOneAndUpdate(
        { _id: req.params.id, userId: req.user._id },
        { isRead: true }
      );
      return res.status(200).json(new ApiResponse(200, null, 'Notification marked as read'));
    } catch (error) {
      next(error);
    }
  },

  markAllAsRead: async (req, res, next) => {
    try {
      await Notification.updateMany({ userId: req.user._id, isRead: false }, { isRead: true });
      return res.status(200).json(new ApiResponse(200, null, 'All notifications marked as read'));
    } catch (error) {
      next(error);
    }
  },
};
