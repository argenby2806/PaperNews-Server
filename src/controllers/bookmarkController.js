const bookmarkService = require('../services/bookmarkService');

const toggleBookmark = async (req, res, next) => {
  try {
    const result = await bookmarkService.toggleBookmark(req.user._id, req.params.articleId);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const getBookmarks = async (req, res, next) => {
  try {
    const result = await bookmarkService.getBookmarks(req.user._id, {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
    });
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const checkBookmark = async (req, res, next) => {
  try {
    const result = await bookmarkService.checkBookmark(req.user._id, req.params.articleId);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

module.exports = { toggleBookmark, getBookmarks, checkBookmark };
