const AuthorRequest = require('../models/AuthorRequest');
const User = require('../models/User');

/**
 * Create author request (user only).
 */
const createRequest = async (userId, reason) => {
  // Check if user already has a pending request
  const existing = await AuthorRequest.findOne({ user: userId, status: 'pending' });
  if (existing) {
    const error = new Error('Bạn đã có yêu cầu đang chờ xử lý');
    error.statusCode = 400;
    throw error;
  }

  // Check if already an author
  const user = await User.findById(userId);
  if (user.role === 'author' || user.role === 'admin') {
    const error = new Error('Bạn đã là tác giả hoặc admin');
    error.statusCode = 400;
    throw error;
  }

  const request = await AuthorRequest.create({ user: userId, reason });
  return request.populate('user', 'name email');
};

/**
 * List author requests (admin).
 */
const listRequests = async ({ status = 'pending', page = 1, limit = 20 }) => {
  const query = {};
  if (status) query.status = status;

  const total = await AuthorRequest.countDocuments(query);
  const requests = await AuthorRequest.find(query)
    .populate('user', 'name email role createdAt')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  return {
    requests,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Approve or reject request (admin).
 * When approved → upgrade user role to 'author'.
 */
const handleRequest = async (requestId, action) => {
  const request = await AuthorRequest.findById(requestId).populate('user', 'name email');
  if (!request) {
    const error = new Error('Yêu cầu không tồn tại');
    error.statusCode = 404;
    throw error;
  }

  if (request.status !== 'pending') {
    const error = new Error('Yêu cầu đã được xử lý');
    error.statusCode = 400;
    throw error;
  }

  request.status = action; // 'approved' or 'rejected'
  await request.save();

  // If approved, upgrade user role
  if (action === 'approved') {
    await User.findByIdAndUpdate(request.user._id, { role: 'author' });
  }

  return request;
};

module.exports = {
  createRequest,
  listRequests,
  handleRequest,
};
