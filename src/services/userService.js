const User = require('../models/User');
const Article = require('../models/Article');

/**
 * Get user profile by ID.
 */
const getProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('Người dùng không tồn tại');
    error.statusCode = 404;
    throw error;
  }

  // Count user's articles
  const articleCount = await Article.countDocuments({ author: userId });

  const userObj = user.toJSON();
  userObj.articleCount = articleCount;
  userObj.followersCount = user.followers ? user.followers.length : 0;
  userObj.followingCount = user.following ? user.following.length : 0;

  return userObj;
};

/**
 * Update user profile.
 */
const updateProfile = async (userId, updates) => {
  const allowed = ['name', 'bio', 'avatarUrl'];
  const sanitized = {};
  for (const key of allowed) {
    if (updates[key] !== undefined) {
      sanitized[key] = updates[key];
    }
  }

  const user = await User.findByIdAndUpdate(userId, sanitized, { new: true, runValidators: true });
  if (!user) {
    const error = new Error('Người dùng không tồn tại');
    error.statusCode = 404;
    throw error;
  }

  return user;
};

/**
 * Change user password.
 */
const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId).select('+password');
  if (!user) {
    const error = new Error('Người dùng không tồn tại');
    error.statusCode = 404;
    throw error;
  }

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    const error = new Error('Mật khẩu hiện tại không đúng');
    error.statusCode = 400;
    throw error;
  }

  if (newPassword.length < 6) {
    const error = new Error('Mật khẩu mới phải có ít nhất 6 ký tự');
    error.statusCode = 400;
    throw error;
  }

  user.password = newPassword;
  await user.save();
  return { message: 'Đổi mật khẩu thành công' };
};

/**
 * Get public profile (for viewing other users).
 */
const getPublicProfile = async (userId) => {
  const user = await User.findById(userId).select('name bio avatarUrl role followers following createdAt');
  if (!user) {
    const error = new Error('Người dùng không tồn tại');
    error.statusCode = 404;
    throw error;
  }

  const articleCount = await Article.countDocuments({ author: userId, status: 'published' });
  const articles = await Article.find({ author: userId, status: 'published' })
    .populate('category', 'name slug')
    .sort({ publishedAt: -1 })
    .limit(10);

  const userObj = user.toJSON();
  userObj.articleCount = articleCount;
  userObj.followersCount = user.followers ? user.followers.length : 0;
  userObj.followingCount = user.following ? user.following.length : 0;
  userObj.recentArticles = articles;

  return userObj;
};

/**
 * List all users (admin only).
 */
const listUsers = async ({ page = 1, limit = 20, search = '', role = '' }) => {
  const query = {};

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  if (role) {
    query.role = role;
  }

  const total = await User.countDocuments(query);
  const users = await User.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  return {
    users,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Ban or unban a user (admin only).
 */
const toggleBan = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('Người dùng không tồn tại');
    error.statusCode = 404;
    throw error;
  }

  if (user.role === 'admin') {
    const error = new Error('Không thể khóa tài khoản admin');
    error.statusCode = 400;
    throw error;
  }

  user.isBanned = !user.isBanned;
  await user.save();

  return user;
};

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  getPublicProfile,
  listUsers,
  toggleBan,
};
