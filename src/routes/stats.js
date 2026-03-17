const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/statsController');

// GET /api/stats/admin — Admin dashboard stats
router.get('/admin', authenticate, authorize('admin'), ctrl.getAdminStats);

// GET /api/stats/author — Author dashboard stats
router.get('/author', authenticate, authorize('author', 'admin'), ctrl.getAuthorStats);

module.exports = router;
