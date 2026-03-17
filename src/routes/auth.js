const router = require('express').Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const ctrl = require('../controllers/authController');

// POST /api/auth/register
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Tên là bắt buộc'),
    body('email').isEmail().withMessage('Email không hợp lệ'),
    body('password').isLength({ min: 6 }).withMessage('Mật khẩu tối thiểu 6 ký tự'),
  ],
  validate,
  ctrl.register
);

// POST /api/auth/verify-otp
router.post(
  '/verify-otp',
  [
    body('email').isEmail().withMessage('Email không hợp lệ'),
    body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP phải có 6 chữ số'),
  ],
  validate,
  ctrl.verifyOtp
);

// POST /api/auth/resend-otp
router.post(
  '/resend-otp',
  [body('email').isEmail().withMessage('Email không hợp lệ')],
  validate,
  ctrl.resendOtp
);

// POST /api/auth/login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Email không hợp lệ'),
    body('password').notEmpty().withMessage('Mật khẩu là bắt buộc'),
  ],
  validate,
  ctrl.login
);

// POST /api/auth/refresh
router.post(
  '/refresh',
  [body('refreshToken').notEmpty().withMessage('Refresh token là bắt buộc')],
  validate,
  ctrl.refresh
);

// POST /api/auth/forgot-password
router.post(
  '/forgot-password',
  [body('email').isEmail().withMessage('Email không hợp lệ')],
  validate,
  ctrl.forgotPassword
);

// POST /api/auth/verify-reset-otp
router.post(
  '/verify-reset-otp',
  [
    body('email').isEmail().withMessage('Email không hợp lệ'),
    body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP phải có 6 chữ số'),
  ],
  validate,
  ctrl.verifyResetOtp
);

// POST /api/auth/reset-password
router.post(
  '/reset-password',
  [
    body('resetToken').notEmpty().withMessage('Reset token là bắt buộc'),
    body('newPassword').isLength({ min: 6 }).withMessage('Mật khẩu mới tối thiểu 6 ký tự'),
  ],
  validate,
  ctrl.resetPassword
);

module.exports = router;
