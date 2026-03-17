const User = require('../models/User');
const Article = require('../models/Article');

/**
 * Toggle bookmark on an article.
 */
const toggleBookmark = async (userId, articleId) => {
  const article = await Article.findById(articleId);
  if (!article) {
    const error = new Error('Bài viết không tồn tại');
    error.statusCode = 404;
    throw error;
  }

  const user = await User.findById(userId);
  const index = user.bookmarks.indexOf(articleId);
  let bookmarked;

  if (index > -1) {
    user.bookmarks.splice(index, 1);
    await Article.findByIdAndUpdate(articleId, { $inc: { bookmarkCount: -1 } });
    bookmarked = false;
  } else {
    user.bookmarks.push(articleId);
    await Article.findByIdAndUpdate(articleId, { $inc: { bookmarkCount: 1 } });
    bookmarked = true;
  }

  await user.save();
  return { bookmarked, bookmarkCount: article.bookmarkCount + (bookmarked ? 1 : -1) };
};

/**
 * Get user's bookmarked articles (paginated).
 */
const getBookmarks = async (userId, { page = 1, limit = 10 }) => {
  const user = await User.findById(userId);
  const total = user.bookmarks.length;

  const bookmarkIds = user.bookmarks.slice((page - 1) * limit, page * limit);
  const articles = await Article.find({ _id: { $in: bookmarkIds }, status: 'published' })
    .populate('author', 'name avatarUrl')
    .populate('category', 'name slug')
    .sort({ publishedAt: -1 });

  return {
    articles,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

/**
 * Check if a user has bookmarked an article.
 */
const checkBookmark = async (userId, articleId) => {
  const user = await User.findById(userId).select('bookmarks');
  const bookmarked = user.bookmarks.some((id) => id.toString() === articleId);
  return { bookmarked };
};

module.exports = { toggleBookmark, getBookmarks, checkBookmark };
