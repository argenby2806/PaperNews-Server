const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const ctrl = require('../controllers/likeController');

// GET /api/likes/:articleId/check — Check if user liked article
router.get('/:articleId/check', authenticate, ctrl.checkLike);

// POST /api/likes/:articleId — Toggle like
router.post('/:articleId', authenticate, ctrl.toggleLike);

module.exports = router;
