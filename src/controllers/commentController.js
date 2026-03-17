const commentService = require('../services/commentService');

const listComments = async (req, res, next) => {
  try {
    const result = await commentService.listComments(req.params.articleId, {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20,
    });
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const createComment = async (req, res, next) => {
  try {
    const comment = await commentService.createComment(
      req.params.articleId,
      req.user._id,
      req.body.content
    );
    res.status(201).json({ success: true, data: comment });
  } catch (error) {
    next(error);
  }
};

const updateComment = async (req, res, next) => {
  try {
    const comment = await commentService.updateComment(
      req.params.commentId,
      req.user._id,
      req.body.content
    );
    res.json({ success: true, data: comment });
  } catch (error) {
    next(error);
  }
};

const deleteComment = async (req, res, next) => {
  try {
    const result = await commentService.deleteComment(
      req.params.commentId,
      req.user._id,
      req.user.role
    );
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

module.exports = { listComments, createComment, updateComment, deleteComment };
