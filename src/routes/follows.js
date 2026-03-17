const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const ctrl = require('../controllers/followController');

// POST /api/follows/:userId — Toggle follow
router.post('/:userId', authenticate, ctrl.toggleFollow);

// GET /api/follows — Get my following list
router.get('/', authenticate, ctrl.getFollowing);

// GET /api/follows/:userId/check — Check if following a user
router.get('/:userId/check', authenticate, ctrl.checkFollow);

// GET /api/follows/:userId/followers — Get a user's followers
router.get('/:userId/followers', authenticate, ctrl.getFollowers);

// GET /api/follows/:userId/following — Get who a user follows
router.get('/:userId/following', authenticate, ctrl.getFollowingList);

module.exports = router;
