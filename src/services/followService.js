const User = require('../models/User');
const Notification = require('../models/Notification');

/**
 * Toggle follow on a user.
 */
const toggleFollow = async (followerId, targetId) => {
  if (followerId.toString() === targetId.toString()) {
    const error = new Error('Không thể theo dõi chính mình');
    error.statusCode = 400;
    throw error;
  }

  const target = await User.findById(targetId);
  if (!target) {
    const error = new Error('Người dùng không tồn tại');
    error.statusCode = 404;
    throw error;
  }

  const follower = await User.findById(followerId);
  const index = follower.following.indexOf(targetId);
  let followed;

  if (index > -1) {
    follower.following.splice(index, 1);
    target.followers.splice(target.followers.indexOf(followerId), 1);
    followed = false;
  } else {
    follower.following.push(targetId);
    target.followers.push(followerId);
    followed = true;
  }

  await follower.save();
  await target.save();

  return { followed, followerCount: target.followers.length };
};

/**
 * Get list of users the current user follows.
 */
const getFollowing = async (userId, { page = 1, limit = 20 }) => {
  const user = await User.findById(userId).populate({
    path: 'following',
    select: 'name bio avatarUrl followers',
    options: {
      skip: (page - 1) * limit,
      limit,
    },
  });

  const total = user.following.length;

  return {
    users: user.following,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

/**
 * Check if the current user follows a target user.
 */
const checkFollow = async (followerId, targetId) => {
  const follower = await User.findById(followerId).select('following');
  const following = follower.following.some((id) => id.toString() === targetId);
  return { following };
};

/**
 * Get followers of a user (paginated).
 */
const getFollowers = async (userId, { page = 1, limit = 20 }) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('Người dùng không tồn tại');
    error.statusCode = 404;
    throw error;
  }

  const total = user.followers.length;
  const start = (page - 1) * limit;
  const followerIds = user.followers.slice(start, start + limit);

  const users = await User.find({ _id: { $in: followerIds } })
    .select('name bio avatarUrl followers');

  return {
    users,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

/**
 * Get list of users a specific user follows (paginated).
 */
const getFollowingList = async (userId, { page = 1, limit = 20 }) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('Người dùng không tồn tại');
    error.statusCode = 404;
    throw error;
  }

  const total = user.following.length;
  const start = (page - 1) * limit;
  const followingIds = user.following.slice(start, start + limit);

  const users = await User.find({ _id: { $in: followingIds } })
    .select('name bio avatarUrl followers');

  return {
    users,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

module.exports = { toggleFollow, getFollowing, checkFollow, getFollowers, getFollowingList };
