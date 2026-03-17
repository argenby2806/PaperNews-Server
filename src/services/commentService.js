const Comment = require('../models/Comment');
const Article = require('../models/Article');

/**
 * List comments for an article (paginated).
 */
const listComments = async (articleId, { page = 1, limit = 20 }) => {
  const total = await Comment.countDocuments({ article: articleId });
  const comments = await Comment.find({ article: articleId })
    .populate('user', 'name avatarUrl')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  return {
    comments,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

/**
 * Create a comment.
 */
const createComment = async (articleId, userId, content) => {
  const article = await Article.findById(articleId);
  if (!article) {
    const error = new Error('Bài viết không tồn tại');
    error.statusCode = 404;
    throw error;
  }

  const comment = await Comment.create({ article: articleId, user: userId, content });
  return comment.populate('user', 'name avatarUrl');
};

/**
 * Update a comment (owner only).
 */
const updateComment = async (commentId, userId, content) => {
  const comment = await Comment.findById(commentId);
  if (!comment) {
    const error = new Error('Bình luận không tồn tại');
    error.statusCode = 404;
    throw error;
  }

  if (comment.user.toString() !== userId.toString()) {
    const error = new Error('Bạn không có quyền chỉnh sửa bình luận này');
    error.statusCode = 403;
    throw error;
  }

  comment.content = content;
  await comment.save();
  return comment.populate('user', 'name avatarUrl');
};

/**
 * Delete a comment (owner or admin).
 */
const deleteComment = async (commentId, userId, userRole) => {
  const comment = await Comment.findById(commentId);
  if (!comment) {
    const error = new Error('Bình luận không tồn tại');
    error.statusCode = 404;
    throw error;
  }

  if (comment.user.toString() !== userId.toString() && userRole !== 'admin') {
    const error = new Error('Bạn không có quyền xóa bình luận này');
    error.statusCode = 403;
    throw error;
  }

  await Comment.findByIdAndDelete(commentId);
  return { message: 'Đã xóa bình luận' };
};

module.exports = { listComments, createComment, updateComment, deleteComment };
