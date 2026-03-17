const User = require('../models/User');
const Article = require('../models/Article');

/**
 * Toggle like on an article.
 */
const toggleLike = async (userId, articleId) => {
  const article = await Article.findById(articleId);
  if (!article) {
    const error = new Error('Bài viết không tồn tại');
    error.statusCode = 404;
    throw error;
  }

  const user = await User.findById(userId);
  const index = user.likes.indexOf(articleId);
  let liked;

  if (index > -1) {
    user.likes.splice(index, 1);
    liked = false;
  } else {
    user.likes.push(articleId);
    liked = true;
  }

  await user.save();
  return { liked };
};

/**
 * Check if a user has liked an article.
 */
const checkLike = async (userId, articleId) => {
  const user = await User.findById(userId);
  const liked = user.likes.includes(articleId);
  return { liked };
};

module.exports = { toggleLike, checkLike };
