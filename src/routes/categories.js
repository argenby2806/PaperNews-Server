const router = require('express').Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/categoryController');

// GET /api/categories — List all (public)
router.get('/', ctrl.listCategories);

// POST /api/categories — Create (author/admin)
router.post(
  '/',
  authenticate,
  authorize('author', 'admin'),
  [body('name').trim().notEmpty().withMessage('Tên danh mục là bắt buộc')],
  validate,
  ctrl.createCategory
);

// PUT /api/categories/:id — Update (admin)
router.put('/:id', authenticate, authorize('admin'), ctrl.updateCategory);

// DELETE /api/categories/:id — Delete (admin)
router.delete('/:id', authenticate, authorize('admin'), ctrl.deleteCategory);

module.exports = router;
