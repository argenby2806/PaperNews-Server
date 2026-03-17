const statsService = require('../services/statsService');

const getAdminStats = async (req, res, next) => {
  try {
    const stats = await statsService.getAdminStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};

const getAuthorStats = async (req, res, next) => {
  try {
    const stats = await statsService.getAuthorStats(req.user._id);
    res.json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAdminStats, getAuthorStats };
