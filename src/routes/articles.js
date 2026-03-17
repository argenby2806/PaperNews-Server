const router = require('express').Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const ctrl = require('../controllers/articleController');

// GET /api/articles — List articles (public)
router.get('/', ctrl.listArticles);

// GET /api/articles/:id — Get single article (public)
router.get('/:id', ctrl.getArticle);

// POST /api/articles — Create article (author/admin)
router.post(
  '/',
  authenticate,
  authorize('author', 'admin'),
  upload.single('coverImage'),
  [
    body('title').trim().notEmpty().withMessage('Tiêu đề là bắt buộc'),
    body('content').notEmpty().withMessage('Nội dung là bắt buộc'),
  ],
  validate,
  ctrl.createArticle
);

// PUT /api/articles/:id — Update article (owner)
router.put(
  '/:id',
  authenticate,
  authorize('author', 'admin'),
  upload.single('coverImage'),
  ctrl.updateArticle
);

// DELETE /api/articles/:id — Delete article (owner/admin)
router.delete('/:id', authenticate, authorize('author', 'admin'), ctrl.deleteArticle);

// PATCH /api/articles/:id/status — Update status (admin)
router.patch(
  '/:id/status',
  authenticate,
  authorize('admin'),
  [body('status').isIn(['published', 'draft', 'pending', 'rejected']).withMessage('Trạng thái không hợp lệ')],
  validate,
  ctrl.updateArticleStatus
);

// PATCH /api/articles/:id/featured — Toggle featured (admin)
router.patch('/:id/featured', authenticate, authorize('admin'), ctrl.toggleFeatured);

module.exports = router;
