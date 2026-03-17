const router = require('express').Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/authorRequestController');

// POST /api/author-requests — Create request (user only)
router.post(
  '/',
  authenticate,
  [body('reason').trim().notEmpty().withMessage('Lý do là bắt buộc')],
  validate,
  ctrl.createRequest
);

// GET /api/author-requests — List requests (admin)
router.get('/', authenticate, authorize('admin'), ctrl.listRequests);

// PATCH /api/author-requests/:id — Approve/reject (admin)
router.patch(
  '/:id',
  authenticate,
  authorize('admin'),
  [body('action').isIn(['approved', 'rejected']).withMessage('Action phải là approved hoặc rejected')],
  validate,
  ctrl.handleRequest
);

module.exports = router;
