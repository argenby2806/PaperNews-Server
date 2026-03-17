// bookmarkService uses User and Article — no Bookmark model
const mockUser = { findById: jest.fn() };
const mockArticle = { findById: jest.fn(), findByIdAndUpdate: jest.fn(), find: jest.fn() };

jest.mock('../../../src/models/User', () => mockUser);
jest.mock('../../../src/models/Article', () => mockArticle);

const bookmarkService = require('../../../src/services/bookmarkService');

afterEach(() => jest.clearAllMocks());

// ════════════════════════════════════════════════════════════════
// toggleBookmark
// ════════════════════════════════════════════════════════════════
describe('toggleBookmark', () => {
  it('should throw 404 when article not found', async () => {
    mockArticle.findById.mockResolvedValue(null);
    await expect(bookmarkService.toggleBookmark('u1', 'bad')).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it('should add bookmark when not already bookmarked', async () => {
    mockArticle.findById.mockResolvedValue({ _id: 'a1', bookmarkCount: 5 });
    mockUser.findById.mockResolvedValue({
      bookmarks: [],
      save: jest.fn().mockResolvedValue(),
    });
    mockArticle.findByIdAndUpdate.mockResolvedValue();

    const result = await bookmarkService.toggleBookmark('u1', 'a1');
    expect(result.bookmarked).toBe(true);
    expect(mockArticle.findByIdAndUpdate).toHaveBeenCalledWith('a1', { $inc: { bookmarkCount: 1 } });
  });

  it('should remove bookmark when already bookmarked', async () => {
    mockArticle.findById.mockResolvedValue({ _id: 'a1', bookmarkCount: 5 });
    mockUser.findById.mockResolvedValue({
      bookmarks: ['a1'],
      save: jest.fn().mockResolvedValue(),
    });
    mockArticle.findByIdAndUpdate.mockResolvedValue();

    const result = await bookmarkService.toggleBookmark('u1', 'a1');
    expect(result.bookmarked).toBe(false);
    expect(mockArticle.findByIdAndUpdate).toHaveBeenCalledWith('a1', { $inc: { bookmarkCount: -1 } });
  });
});

// ════════════════════════════════════════════════════════════════
// getBookmarks
// ════════════════════════════════════════════════════════════════
describe('getBookmarks', () => {
  it('should return paginated bookmark articles', async () => {
    mockUser.findById.mockResolvedValue({
      bookmarks: ['a1', 'a2', 'a3'],
    });
    const chain = {
      populate: jest.fn().mockReturnThis(),
      sort: jest.fn().mockResolvedValue([{ title: 'A1' }]),
    };
    mockArticle.find.mockReturnValue(chain);

    const result = await bookmarkService.getBookmarks('u1', { page: 1, limit: 10 });
    expect(result.articles).toHaveLength(1);
    expect(result.pagination.total).toBe(3);
  });
});

// ════════════════════════════════════════════════════════════════
// checkBookmark
// ════════════════════════════════════════════════════════════════
describe('checkBookmark', () => {
  it('should return true when article is bookmarked', async () => {
    const sel = { select: jest.fn().mockResolvedValue({ bookmarks: [{ toString: () => 'a1' }] }) };
    mockUser.findById.mockReturnValue(sel);

    const result = await bookmarkService.checkBookmark('u1', 'a1');
    expect(result.bookmarked).toBe(true);
  });

  it('should return false when article is not bookmarked', async () => {
    const sel = { select: jest.fn().mockResolvedValue({ bookmarks: [{ toString: () => 'a2' }] }) };
    mockUser.findById.mockReturnValue(sel);

    const result = await bookmarkService.checkBookmark('u1', 'a1');
    expect(result.bookmarked).toBe(false);
  });
});
