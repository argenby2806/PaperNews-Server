const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const ctrl = require('../controllers/notificationController');

// GET /api/notifications — Get my notifications
router.get('/', authenticate, ctrl.listNotifications);

// GET /api/notifications/unread-count — Get unread count
router.get('/unread-count', authenticate, ctrl.getUnreadCount);

// PATCH /api/notifications/:id/read — Mark as read
router.patch('/:id/read', authenticate, ctrl.markAsRead);

// PATCH /api/notifications/read-all — Mark all as read
router.patch('/read-all', authenticate, ctrl.markAllAsRead);

module.exports = router;
