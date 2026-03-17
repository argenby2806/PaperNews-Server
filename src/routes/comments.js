const router = require('express').Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const ctrl = require('../controllers/commentController');

// GET /api/comments/:articleId — List comments for an article (public)
router.get('/:articleId', ctrl.listComments);

// POST /api/comments/:articleId — Create comment
router.post(
  '/:articleId',
  authenticate,
  [body('content').trim().notEmpty().withMessage('Nội dung bình luận là bắt buộc')],
  validate,
  ctrl.createComment
);

// PUT /api/comments/:commentId — Update comment (owner)
router.put(
  '/:commentId',
  authenticate,
  [body('content').trim().notEmpty().withMessage('Nội dung bình luận là bắt buộc')],
  validate,
  ctrl.updateComment
);

// DELETE /api/comments/:commentId — Delete comment (owner/admin)
router.delete('/:commentId', authenticate, ctrl.deleteComment);

module.exports = router;
