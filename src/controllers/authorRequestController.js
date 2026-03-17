const authorRequestService = require('../services/authorRequestService');

const createRequest = async (req, res, next) => {
  try {
    const request = await authorRequestService.createRequest(req.user._id, req.body.reason);
    res.status(201).json({ success: true, data: request });
  } catch (error) {
    next(error);
  }
};

const listRequests = async (req, res, next) => {
  try {
    const result = await authorRequestService.listRequests({
      status: req.query.status,
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20,
    });
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const handleRequest = async (req, res, next) => {
  try {
    const request = await authorRequestService.handleRequest(req.params.id, req.body.action);
    res.json({ success: true, data: request });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRequest,
  listRequests,
  handleRequest,
};
