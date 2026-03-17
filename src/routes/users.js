const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/userController');

// GET /api/users/me — Get my profile
router.get('/me', authenticate, ctrl.getProfile);

// PUT /api/users/me — Update my profile
router.put('/me', authenticate, ctrl.updateProfile);

// PATCH /api/users/me/password — Change password
router.patch('/me/password', authenticate, ctrl.changePassword);

// GET /api/users/:id/profile — Public profile
router.get('/:id/profile', ctrl.getPublicProfile);

// GET /api/users — List all users (admin)
router.get('/', authenticate, authorize('admin'), ctrl.listUsers);

// PATCH /api/users/:id/ban — Ban/unban user (admin)
router.patch('/:id/ban', authenticate, authorize('admin'), ctrl.toggleBan);

module.exports = router;
