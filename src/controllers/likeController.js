const likeService = require('../services/likeService');

const toggleLike = async (req, res, next) => {
  try {
    const result = await likeService.toggleLike(req.user._id, req.params.articleId);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const checkLike = async (req, res, next) => {
  try {
    const result = await likeService.checkLike(req.user._id, req.params.articleId);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

module.exports = { toggleLike, checkLike };
