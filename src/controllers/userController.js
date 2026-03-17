const userService = require('../services/userService');

const getProfile = async (req, res, next) => {
  try {
    const user = await userService.getProfile(req.user._id);
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const user = await userService.updateProfile(req.user._id, req.body);
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

const listUsers = async (req, res, next) => {
  try {
    const { page, limit, search, role } = req.query;
    const result = await userService.listUsers({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
      search,
      role,
    });
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const toggleBan = async (req, res, next) => {
  try {
    const user = await userService.toggleBan(req.params.id);
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const result = await userService.changePassword(
      req.user._id,
      req.body.currentPassword,
      req.body.newPassword
    );
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const getPublicProfile = async (req, res, next) => {
  try {
    const user = await userService.getPublicProfile(req.params.id);
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  getPublicProfile,
  listUsers,
  toggleBan,
};
