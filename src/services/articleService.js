const Article = require('../models/Article');
const Category = require('../models/Category');
const categoryService = require('./categoryService');

/**
 * List articles with filtering, search, and pagination.
 */
const listArticles = async ({
  page = 1,
  limit = 10,
  status = 'published',
  category,
  author,
  search,
  featured,
  sortBy = 'publishedAt',
  sortOrder = 'desc',
}) => {
  const query = {};

  if (status) query.status = status;
  if (category) query.category = category;
  if (author) query.author = author;
  if (featured === 'true') query.isFeatured = true;

  if (search) {
    query.$text = { $search: search };
  }

  const sort = {};
  sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

  const total = await Article.countDocuments(query);
  const articles = await Article.find(query)
    .populate('author', 'name avatarUrl')
    .populate('category', 'name slug')
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(limit);

  return {
    articles,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get single article by ID and increment view count.
 */
const getArticleById = async (articleId) => {
  const article = await Article.findByIdAndUpdate(
    articleId,
    { $inc: { viewCount: 1 } },
    { new: true }
  )
    .populate('author', 'name bio avatarUrl')
    .populate('category', 'name slug');

  if (!article) {
    const error = new Error('Bài viết không tồn tại');
    error.statusCode = 404;
    throw error;
  }

  return article;
};

/**
 * Create a new article.
 * Accepts either `category` (ObjectId) or `categoryName` (string).
 * If categoryName is provided, auto find-or-create the category.
 */
const createArticle = async (data, authorId) => {
  // If author sent a category name string, resolve it to an ObjectId
  if (data.categoryName && !data.category) {
    const cat = await categoryService.findOrCreate(data.categoryName);
    if (cat) data.category = cat._id;
    delete data.categoryName;
  }

  // Auto-generate excerpt from content if not provided
  if (!data.excerpt && data.content) {
    data.excerpt = data.content.replace(/[#*>\-`\[\]()]/g, '').trim().substring(0, 200);
  }

  const article = await Article.create({
    ...data,
    author: authorId,
    publishedAt: data.status === 'published' ? new Date() : undefined,
  });

  // Update category article count
  if (data.category) {
    await Category.findByIdAndUpdate(data.category, { $inc: { articleCount: 1 } });
  }

  return article.populate(['author', 'category']);
};

/**
 * Update an article (must be owner).
 */
const updateArticle = async (articleId, updates, userId) => {
  const article = await Article.findById(articleId);
  if (!article) {
    const error = new Error('Bài viết không tồn tại');
    error.statusCode = 404;
    throw error;
  }

  if (article.author.toString() !== userId.toString()) {
    const error = new Error('Bạn không có quyền chỉnh sửa bài viết này');
    error.statusCode = 403;
    throw error;
  }

  // If category changed, update counts
  if (updates.category && updates.category !== article.category.toString()) {
    await Category.findByIdAndUpdate(article.category, { $inc: { articleCount: -1 } });
    await Category.findByIdAndUpdate(updates.category, { $inc: { articleCount: 1 } });
  }

  // If status changed to published, set publishedAt
  if (updates.status === 'published' && article.status !== 'published') {
    updates.publishedAt = new Date();
  }

  const updated = await Article.findByIdAndUpdate(articleId, updates, { new: true, runValidators: true })
    .populate('author', 'name avatarUrl')
    .populate('category', 'name slug');

  return updated;
};

/**
 * Delete an article (owner or admin).
 */
const deleteArticle = async (articleId, userId, userRole) => {
  const article = await Article.findById(articleId);
  if (!article) {
    const error = new Error('Bài viết không tồn tại');
    error.statusCode = 404;
    throw error;
  }

  if (article.author.toString() !== userId.toString() && userRole !== 'admin') {
    const error = new Error('Bạn không có quyền xóa bài viết này');
    error.statusCode = 403;
    throw error;
  }

  await Article.findByIdAndDelete(articleId);

  // Decrement category count
  await Category.findByIdAndUpdate(article.category, { $inc: { articleCount: -1 } });

  return { message: 'Đã xóa bài viết' };
};

/**
 * Update article status (admin: approve/reject).
 */
const updateArticleStatus = async (articleId, { status, rejectReason }) => {
  const updates = { status };

  if (status === 'rejected' && rejectReason) {
    updates.rejectReason = rejectReason;
  }

  if (status === 'published') {
    updates.publishedAt = new Date();
    updates.rejectReason = '';
  }

  const article = await Article.findByIdAndUpdate(articleId, updates, { new: true })
    .populate('author', 'name avatarUrl')
    .populate('category', 'name slug');

  if (!article) {
    const error = new Error('Bài viết không tồn tại');
    error.statusCode = 404;
    throw error;
  }

  return article;
};

/**
 * Toggle featured status of an article (admin only).
 */
const toggleFeatured = async (articleId) => {
  const article = await Article.findById(articleId);
  if (!article) {
    const error = new Error('Bài viết không tồn tại');
    error.statusCode = 404;
    throw error;
  }

  article.isFeatured = !article.isFeatured;
  await article.save();

  return article;
};

module.exports = {
  listArticles,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle,
  updateArticleStatus,
  toggleFeatured,
};
