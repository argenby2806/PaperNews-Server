const Notification = require('../models/Notification');

/**
 * Create a notification.
 */
const createNotification = async ({ userId, type, title, body = '', data = {} }) => {
  return Notification.create({ user: userId, type, title, body, data });
};

/**
 * List notifications (paginated).
 */
const listNotifications = async (userId, { page = 1, limit = 20 }) => {
  const total = await Notification.countDocuments({ user: userId });
  const unreadCount = await Notification.countDocuments({ user: userId, isRead: false });

  const notifications = await Notification.find({ user: userId })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  return {
    notifications,
    unreadCount,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

/**
 * Mark a single notification as read.
 */
const markAsRead = async (notificationId, userId) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, user: userId },
    { isRead: true },
    { new: true }
  );

  if (!notification) {
    const error = new Error('Thông báo không tồn tại');
    error.statusCode = 404;
    throw error;
  }

  return notification;
};

/**
 * Mark all notifications as read.
 */
const markAllAsRead = async (userId) => {
  await Notification.updateMany({ user: userId, isRead: false }, { isRead: true });
  return { message: 'Đã đánh dấu tất cả đã đọc' };
};

module.exports = { createNotification, listNotifications, markAsRead, markAllAsRead };
