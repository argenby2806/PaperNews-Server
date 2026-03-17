const Article = require('../models/Article');
const User = require('../models/User');
const Category = require('../models/Category');
const Comment = require('../models/Comment');
const AuthorRequest = require('../models/AuthorRequest');

/**
 * Get admin dashboard stats.
 */
const getAdminStats = async () => {
  const [totalUsers, totalArticles, totalCategories, pendingArticles, pendingRequests] =
    await Promise.all([
      User.countDocuments(),
      Article.countDocuments(),
      Category.countDocuments(),
      Article.countDocuments({ status: 'pending' }),
      AuthorRequest.countDocuments({ status: 'pending' }),
    ]);

  // Recent articles (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentArticles = await Article.countDocuments({ createdAt: { $gte: sevenDaysAgo } });

  // Top categories
  const topCategories = await Category.find()
    .sort({ articleCount: -1 })
    .limit(5)
    .select('name articleCount');

  // User distribution by role
  const usersByRole = await User.aggregate([
    { $group: { _id: '$role', count: { $sum: 1 } } },
  ]);

  return {
    totalUsers,
    totalArticles,
    totalCategories,
    pendingArticles,
    pendingRequests,
    recentArticles,
    topCategories,
    usersByRole,
  };
};

/**
 * Get author dashboard stats.
 */
const getAuthorStats = async (authorId) => {
  const [totalArticles, publishedArticles, pendingArticles, draftArticles, rejectedArticles] =
    await Promise.all([
      Article.countDocuments({ author: authorId }),
      Article.countDocuments({ author: authorId, status: 'published' }),
      Article.countDocuments({ author: authorId, status: 'pending' }),
      Article.countDocuments({ author: authorId, status: 'draft' }),
      Article.countDocuments({ author: authorId, status: 'rejected' }),
    ]);

  // Total views across all articles
  const viewsResult = await Article.aggregate([
    { $match: { author: authorId } },
    { $group: { _id: null, totalViews: { $sum: '$viewCount' }, totalBookmarks: { $sum: '$bookmarkCount' } } },
  ]);

  const totalViews = viewsResult[0]?.totalViews || 0;
  const totalBookmarks = viewsResult[0]?.totalBookmarks || 0;

  // Follower count
  const author = await User.findById(authorId);
  const followerCount = author.followers ? author.followers.length : 0;

  // Total comments on author's articles
  const authorArticleIds = await Article.find({ author: authorId }).select('_id');
  const totalComments = await Comment.countDocuments({
    article: { $in: authorArticleIds.map((a) => a._id) },
  });

  return {
    totalArticles,
    publishedArticles,
    pendingArticles,
    draftArticles,
    rejectedArticles,
    totalViews,
    totalBookmarks,
    followerCount,
    totalComments,
  };
};

module.exports = { getAdminStats, getAuthorStats };
