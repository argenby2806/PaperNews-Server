const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Article = require('../models/Article');
const Otp = require('../models/Otp');
const generateOtp = require('../utils/generateOtp');
const { sendOtpEmail } = require('./emailService');

/**
 * Generate JWT access token (short-lived).
 */
const generateAccessToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m',
  });
};

/**
 * Generate JWT refresh token (long-lived).
 */
const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d',
  });
};

/**
 * Register a new user → send OTP email.
 */
const register = async ({ name, email, password }) => {
  // Check if email already exists
  const existing = await User.findOne({ email });
  if (existing) {
    const error = new Error('Email đã được sử dụng');
    error.statusCode = 409;
    throw error;
  }

  // Create user (unverified)
  const user = await User.create({ name, email, password });

  // Generate & save OTP
  const code = generateOtp();
  await Otp.deleteMany({ email, type: 'register' }); // clear old OTPs
  await Otp.create({ email, code, type: 'register' });

  // Send email
  await sendOtpEmail(email, code, 'register');

  return { userId: user._id, message: 'Đăng ký thành công. Vui lòng kiểm tra email để xác thực.' };
};

/**
 * Verify OTP → issue tokens.
 */
const verifyOtp = async ({ email, otp }) => {
  const otpRecord = await Otp.findOne({ email, code: otp, type: 'register' });
  if (!otpRecord) {
    const error = new Error('OTP không hợp lệ hoặc đã hết hạn');
    error.statusCode = 400;
    throw error;
  }

  // Mark user as verified
  const user = await User.findOneAndUpdate(
    { email },
    { isVerified: true },
    { new: true }
  );

  if (!user) {
    const error = new Error('Người dùng không tồn tại');
    error.statusCode = 404;
    throw error;
  }

  // Delete used OTP
  await Otp.deleteMany({ email, type: 'register' });

  // Issue tokens
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  return { accessToken, refreshToken, user };
};

/**
 * Resend OTP for registration.
 */
const resendOtp = async ({ email }) => {
  const user = await User.findOne({ email });
  if (!user) {
    const error = new Error('Email không tồn tại');
    error.statusCode = 404;
    throw error;
  }

  if (user.isVerified) {
    const error = new Error('Tài khoản đã được xác thực');
    error.statusCode = 400;
    throw error;
  }

  const code = generateOtp();
  await Otp.deleteMany({ email, type: 'register' });
  await Otp.create({ email, code, type: 'register' });
  await sendOtpEmail(email, code, 'register');

  return { message: 'OTP đã được gửi lại' };
};

/**
 * Login with email + password.
 */
const login = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    const error = new Error('Email hoặc mật khẩu không đúng');
    error.statusCode = 401;
    throw error;
  }

  if (!user.isVerified) {
    const error = new Error('Tài khoản chưa được xác thực. Vui lòng kiểm tra email.');
    error.statusCode = 403;
    throw error;
  }

  if (user.isBanned) {
    const error = new Error('Tài khoản đã bị khóa');
    error.statusCode = 403;
    throw error;
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const error = new Error('Email hoặc mật khẩu không đúng');
    error.statusCode = 401;
    throw error;
  }

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // Remove password from response
  user.password = undefined;

  // Compute stats for profile display
  const userObj = user.toJSON();
  const articleCount = await Article.countDocuments({ author: user._id });
  userObj.articleCount = articleCount;
  userObj.followersCount = user.followers ? user.followers.length : 0;
  userObj.followingCount = user.following ? user.following.length : 0;

  return { accessToken, refreshToken, user: userObj };
};

/**
 * Refresh access token using a valid refresh token.
 */
const refreshAccessToken = async ({ refreshToken }) => {
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user || user.isBanned) {
      const error = new Error('Token không hợp lệ');
      error.statusCode = 401;
      throw error;
    }

    const newAccessToken = generateAccessToken(user._id);
    return { accessToken: newAccessToken };
  } catch (err) {
    const error = new Error('Refresh token không hợp lệ hoặc đã hết hạn');
    error.statusCode = 401;
    throw error;
  }
};

/**
 * Forgot password → send reset OTP.
 */
const forgotPassword = async ({ email }) => {
  const user = await User.findOne({ email });
  if (!user) {
    // Don't reveal email existence
    return { message: 'Nếu email tồn tại, OTP đặt lại mật khẩu đã được gửi.' };
  }

  const code = generateOtp();
  await Otp.deleteMany({ email, type: 'reset' });
  await Otp.create({ email, code, type: 'reset' });
  await sendOtpEmail(email, code, 'reset');

  return { message: 'Nếu email tồn tại, OTP đặt lại mật khẩu đã được gửi.' };
};

/**
 * Verify reset OTP → return a short-lived reset token.
 */
const verifyResetOtp = async ({ email, otp }) => {
  const otpRecord = await Otp.findOne({ email, code: otp, type: 'reset' });
  if (!otpRecord) {
    const error = new Error('OTP không hợp lệ hoặc đã hết hạn');
    error.statusCode = 400;
    throw error;
  }

  await Otp.deleteMany({ email, type: 'reset' });

  // Issue short-lived reset token (10 min)
  const resetToken = jwt.sign({ email }, process.env.JWT_RESET_SECRET, { expiresIn: '10m' });

  return { resetToken };
};

/**
 * Reset password using a valid reset token.
 */
const resetPassword = async ({ resetToken, newPassword }) => {
  try {
    const decoded = jwt.verify(resetToken, process.env.JWT_RESET_SECRET);
    const user = await User.findOne({ email: decoded.email });

    if (!user) {
      const error = new Error('Người dùng không tồn tại');
      error.statusCode = 404;
      throw error;
    }

    user.password = newPassword;
    await user.save();

    return { message: 'Đặt lại mật khẩu thành công' };
  } catch (err) {
    if (err.statusCode) throw err;
    const error = new Error('Reset token không hợp lệ hoặc đã hết hạn');
    error.statusCode = 400;
    throw error;
  }
};

module.exports = {
  register,
  verifyOtp,
  resendOtp,
  login,
  refreshAccessToken,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
};
