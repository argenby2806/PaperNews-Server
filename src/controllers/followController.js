const followService = require('../services/followService');

const toggleFollow = async (req, res, next) => {
  try {
    const result = await followService.toggleFollow(req.user._id, req.params.userId);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const getFollowing = async (req, res, next) => {
  try {
    const result = await followService.getFollowing(req.user._id, {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20,
    });
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const checkFollow = async (req, res, next) => {
  try {
    const result = await followService.checkFollow(req.user._id, req.params.userId);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const getFollowers = async (req, res, next) => {
  try {
    const result = await followService.getFollowers(req.params.userId, {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20,
    });
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const getFollowingList = async (req, res, next) => {
  try {
    const result = await followService.getFollowingList(req.params.userId, {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20,
    });
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

module.exports = { toggleFollow, getFollowing, checkFollow, getFollowers, getFollowingList };
