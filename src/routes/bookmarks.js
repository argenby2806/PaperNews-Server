const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const ctrl = require('../controllers/bookmarkController');

// POST /api/bookmarks/:articleId — Toggle bookmark
router.post('/:articleId', authenticate, ctrl.toggleBookmark);

// GET /api/bookmarks — Get my bookmarks
router.get('/', authenticate, ctrl.getBookmarks);

// GET /api/bookmarks/:articleId/check — Check if bookmarked
router.get('/:articleId/check', authenticate, ctrl.checkBookmark);

module.exports = router;
