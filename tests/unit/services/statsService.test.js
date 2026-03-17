// statsService uses Article, User, Category, Comment, AuthorRequest
const mockArticle = { countDocuments: jest.fn(), aggregate: jest.fn(), find: jest.fn() };
const mockUser = { countDocuments: jest.fn(), aggregate: jest.fn(), findById: jest.fn() };
const mockCategory = { countDocuments: jest.fn(), find: jest.fn() };
const mockComment = { countDocuments: jest.fn() };
const mockAuthorRequest = { countDocuments: jest.fn() };

jest.mock('../../../src/models/Article', () => mockArticle);
jest.mock('../../../src/models/User', () => mockUser);
jest.mock('../../../src/models/Category', () => mockCategory);
jest.mock('../../../src/models/Comment', () => mockComment);
jest.mock('../../../src/models/AuthorRequest', () => mockAuthorRequest);

const statsService = require('../../../src/services/statsService');

afterEach(() => jest.clearAllMocks());

// ════════════════════════════════════════════════════════════════
// getAdminStats
// ════════════════════════════════════════════════════════════════
describe('getAdminStats', () => {
  it('should return dashboard stats', async () => {
    mockUser.countDocuments.mockResolvedValue(100);
    mockArticle.countDocuments
      .mockResolvedValueOnce(500)  // totalArticles
      .mockResolvedValueOnce(80)   // pendingArticles
      .mockResolvedValueOnce(10);  // recentArticles
    mockCategory.countDocuments.mockResolvedValue(15);
    mockAuthorRequest.countDocuments.mockResolvedValue(5);

    // topCategories: Category.find().sort().limit().select()
    const catChain = {
      sort: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      select: jest.fn().mockResolvedValue([{ name: 'Tech', articleCount: 100 }]),
    };
    mockCategory.find.mockReturnValue(catChain);

    // usersByRole: User.aggregate
    mockUser.aggregate.mockResolvedValue([{ _id: 'user', count: 80 }]);

    const result = await statsService.getAdminStats();
    expect(result.totalUsers).toBe(100);
    expect(result.totalArticles).toBe(500);
    expect(result.totalCategories).toBe(15);
    expect(result.pendingArticles).toBe(80);
    expect(result.pendingRequests).toBe(5);
    expect(result.topCategories).toHaveLength(1);
    expect(result.usersByRole).toHaveLength(1);
  });
});

// ════════════════════════════════════════════════════════════════
// getAuthorStats
// ════════════════════════════════════════════════════════════════
describe('getAuthorStats', () => {
  it('should return author-specific stats', async () => {
    mockArticle.countDocuments
      .mockResolvedValueOnce(50)  // total
      .mockResolvedValueOnce(40)  // published
      .mockResolvedValueOnce(5)   // pending
      .mockResolvedValueOnce(3)   // draft
      .mockResolvedValueOnce(2);  // rejected

    // viewsResult aggregate
    mockArticle.aggregate.mockResolvedValueOnce([
      { totalViews: 10000, totalBookmarks: 200 },
    ]);

    mockUser.findById.mockResolvedValue({ followers: ['f1', 'f2'] });

    // Article.find for IDs → .select('_id')
    const selectChain = { select: jest.fn().mockResolvedValue([{ _id: 'a1' }, { _id: 'a2' }]) };
    mockArticle.find.mockReturnValue(selectChain);

    mockComment.countDocuments.mockResolvedValue(123);

    const result = await statsService.getAuthorStats('author1');
    expect(result.totalArticles).toBe(50);
    expect(result.publishedArticles).toBe(40);
    expect(result.totalViews).toBe(10000);
    expect(result.totalBookmarks).toBe(200);
    expect(result.followerCount).toBe(2);
    expect(result.totalComments).toBe(123);
  });

  it('should default totals to 0 when no aggregate result', async () => {
    mockArticle.countDocuments.mockResolvedValue(0);
    mockArticle.aggregate.mockResolvedValueOnce([]);
    mockUser.findById.mockResolvedValue({ followers: [] });
    const selectChain = { select: jest.fn().mockResolvedValue([]) };
    mockArticle.find.mockReturnValue(selectChain);
    mockComment.countDocuments.mockResolvedValue(0);

    const result = await statsService.getAuthorStats('author1');
    expect(result.totalViews).toBe(0);
    expect(result.totalBookmarks).toBe(0);
    expect(result.followerCount).toBe(0);
  });
});
