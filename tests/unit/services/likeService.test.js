// likeService uses User and Article — likes stored on User.likes array
const mockUser = { findById: jest.fn() };
const mockArticle = { findById: jest.fn() };

jest.mock('../../../src/models/User', () => mockUser);
jest.mock('../../../src/models/Article', () => mockArticle);

const likeService = require('../../../src/services/likeService');

afterEach(() => jest.clearAllMocks());

// ════════════════════════════════════════════════════════════════
// toggleLike
// ════════════════════════════════════════════════════════════════
describe('toggleLike', () => {
  it('should throw 404 when article not found', async () => {
    mockArticle.findById.mockResolvedValue(null);
    await expect(likeService.toggleLike('u1', 'bad')).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it('should add like when user has not liked', async () => {
    mockArticle.findById.mockResolvedValue({ _id: 'a1' });
    mockUser.findById.mockResolvedValue({
      likes: [],
      save: jest.fn().mockResolvedValue(),
    });

    const result = await likeService.toggleLike('u1', 'a1');
    expect(result.liked).toBe(true);
  });

  it('should remove like when user has already liked', async () => {
    mockArticle.findById.mockResolvedValue({ _id: 'a1' });
    mockUser.findById.mockResolvedValue({
      likes: ['a1'],
      save: jest.fn().mockResolvedValue(),
    });

    const result = await likeService.toggleLike('u1', 'a1');
    expect(result.liked).toBe(false);
  });
});

// ════════════════════════════════════════════════════════════════
// checkLike
// ════════════════════════════════════════════════════════════════
describe('checkLike', () => {
  it('should return true when user has liked', async () => {
    mockUser.findById.mockResolvedValue({ likes: ['a1', 'a2'] });
    const result = await likeService.checkLike('u1', 'a1');
    expect(result.liked).toBe(true);
  });

  it('should return false when user has not liked', async () => {
    mockUser.findById.mockResolvedValue({ likes: ['a2'] });
    const result = await likeService.checkLike('u1', 'a1');
    expect(result.liked).toBe(false);
  });
});
