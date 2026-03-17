const articleService = require('../services/articleService');
const { uploadToGridFS, deleteFromGridFS } = require('../utils/gridfs');

const listArticles = async (req, res, next) => {
  try {
    const result = await articleService.listArticles({
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
      status: req.query.status,
      category: req.query.category,
      author: req.query.author,
      search: req.query.search,
      featured: req.query.featured,
      sortBy: req.query.sortBy,
      sortOrder: req.query.sortOrder,
    });
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const getArticle = async (req, res, next) => {
  try {
    const article = await articleService.getArticleById(req.params.id);
    res.json({ success: true, data: article });
  } catch (error) {
    next(error);
  }
};

const createArticle = async (req, res, next) => {
  try {
    const data = { ...req.body };
    if (req.file) {
      const fileId = await uploadToGridFS(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype
      );
      data.coverImage = `/api/media/${fileId}`;
    }

    const article = await articleService.createArticle(data, req.user._id);
    res.status(201).json({ success: true, data: article });
  } catch (error) {
    next(error);
  }
};

const updateArticle = async (req, res, next) => {
  try {
    const data = { ...req.body };
    if (req.file) {
      // Delete old GridFS file if replacing
      const existing = await articleService.getArticleById(req.params.id);
      if (existing?.coverImage?.startsWith('/api/media/')) {
        const oldId = existing.coverImage.split('/').pop();
        await deleteFromGridFS(oldId).catch(() => {});
      }

      const fileId = await uploadToGridFS(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype
      );
      data.coverImage = `/api/media/${fileId}`;
    }

    const article = await articleService.updateArticle(req.params.id, data, req.user._id);
    res.json({ success: true, data: article });
  } catch (error) {
    next(error);
  }
};

const deleteArticle = async (req, res, next) => {
  try {
    const result = await articleService.deleteArticle(req.params.id, req.user._id, req.user.role);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const updateArticleStatus = async (req, res, next) => {
  try {
    const article = await articleService.updateArticleStatus(req.params.id, req.body);
    res.json({ success: true, data: article });
  } catch (error) {
    next(error);
  }
};

const toggleFeatured = async (req, res, next) => {
  try {
    const article = await articleService.toggleFeatured(req.params.id);
    res.json({ success: true, data: article });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listArticles,
  getArticle,
  createArticle,
  updateArticle,
  deleteArticle,
  updateArticleStatus,
  toggleFeatured,
};
