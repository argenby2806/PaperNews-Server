// ── Mock models ──────────────────────────────────────────────
const mockUser = {
  findById: jest.fn(),
  find: jest.fn(),
};

jest.mock('../../../src/models/User', () => mockUser);
jest.mock('../../../src/models/Notification', () => ({}));

const followService = require('../../../src/services/followService');

afterEach(() => jest.clearAllMocks());

// ════════════════════════════════════════════════════════════════
// toggleFollow
// ════════════════════════════════════════════════════════════════
describe('toggleFollow', () => {
  it('should throw 400 when trying to follow yourself', async () => {
    await expect(followService.toggleFollow('u1', 'u1')).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it('should throw 404 when target user not found', async () => {
    mockUser.findById.mockResolvedValueOnce(null); // target
    await expect(followService.toggleFollow('u1', 'u2')).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it('should follow a user (add to following/followers)', async () => {
    const target = { _id: 'u2', followers: [], save: jest.fn().mockResolvedValue() };
    const follower = { _id: 'u1', following: [], save: jest.fn().mockResolvedValue() };

    mockUser.findById
      .mockResolvedValueOnce(target) // first call: target
      .mockResolvedValueOnce(follower); // second call: follower

    const result = await followService.toggleFollow('u1', 'u2');
    expect(result.followed).toBe(true);
    expect(result.followerCount).toBe(1);
    expect(follower.following).toContain('u2');
    expect(target.followers).toContain('u1');
  });

  it('should unfollow a user (remove from following/followers)', async () => {
    const target = { _id: 'u2', followers: ['u1'], save: jest.fn().mockResolvedValue() };
    const follower = { _id: 'u1', following: ['u2'], save: jest.fn().mockResolvedValue() };

    mockUser.findById
      .mockResolvedValueOnce(target)
      .mockResolvedValueOnce(follower);

    const result = await followService.toggleFollow('u1', 'u2');
    expect(result.followed).toBe(false);
    expect(result.followerCount).toBe(0);
  });
});

// ════════════════════════════════════════════════════════════════
// checkFollow
// ════════════════════════════════════════════════════════════════
describe('checkFollow', () => {
  it('should return true when user is following', async () => {
    const chain = { select: jest.fn().mockResolvedValue({ following: ['u2'] }) };
    mockUser.findById.mockReturnValue(chain);

    const result = await followService.checkFollow('u1', 'u2');
    expect(result.following).toBe(true);
  });

  it('should return false when user is not following', async () => {
    const chain = { select: jest.fn().mockResolvedValue({ following: [] }) };
    mockUser.findById.mockReturnValue(chain);

    const result = await followService.checkFollow('u1', 'u2');
    expect(result.following).toBe(false);
  });
});

// ════════════════════════════════════════════════════════════════
// getFollowers
// ════════════════════════════════════════════════════════════════
describe('getFollowers', () => {
  it('should throw 404 when user not found', async () => {
    mockUser.findById.mockResolvedValue(null);
    await expect(followService.getFollowers('bad', {})).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it('should return paginated followers', async () => {
    mockUser.findById.mockResolvedValue({ followers: ['f1', 'f2'] });
    const chain = { select: jest.fn().mockResolvedValue([{ name: 'F1' }, { name: 'F2' }]) };
    mockUser.find.mockReturnValue(chain);

    const result = await followService.getFollowers('u1', { page: 1, limit: 20 });
    expect(result.pagination.total).toBe(2);
    expect(result.users).toHaveLength(2);
  });
});

// ════════════════════════════════════════════════════════════════
// getFollowingList
// ════════════════════════════════════════════════════════════════
describe('getFollowingList', () => {
  it('should throw 404 when user not found', async () => {
    mockUser.findById.mockResolvedValue(null);
    await expect(followService.getFollowingList('bad', {})).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it('should return paginated following list', async () => {
    mockUser.findById.mockResolvedValue({ following: ['t1'] });
    const chain = { select: jest.fn().mockResolvedValue([{ name: 'T1' }]) };
    mockUser.find.mockReturnValue(chain);

    const result = await followService.getFollowingList('u1', { page: 1, limit: 20 });
    expect(result.pagination.total).toBe(1);
  });
});
