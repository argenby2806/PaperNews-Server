// ── Mock models ──────────────────────────────────────────────
const mockComment = {
  find: jest.fn(),
  findById: jest.fn(),
  findByIdAndDelete: jest.fn(),
  countDocuments: jest.fn(),
  create: jest.fn(),
};

const mockArticle = {
  findById: jest.fn(),
};

jest.mock('../../../src/models/Comment', () => mockComment);
jest.mock('../../../src/models/Article', () => mockArticle);

const commentService = require('../../../src/services/commentService');

afterEach(() => jest.clearAllMocks());

// ── Helpers ──────────────────────────────────────────────────
const chainable = (result) => {
  const chain = {};
  chain.populate = jest.fn().mockReturnValue(chain);
  chain.sort = jest.fn().mockReturnValue(chain);
  chain.skip = jest.fn().mockReturnValue(chain);
  chain.limit = jest.fn().mockResolvedValue(result);
  return chain;
};

// ════════════════════════════════════════════════════════════════
// listComments
// ════════════════════════════════════════════════════════════════
describe('listComments', () => {
  it('should return paginated comments', async () => {
    mockComment.countDocuments.mockResolvedValue(5);
    const chain = chainable([{ content: 'Nice' }]);
    mockComment.find.mockReturnValue(chain);

    const result = await commentService.listComments('art1', { page: 1, limit: 20 });
    expect(result.comments).toHaveLength(1);
    expect(result.pagination.total).toBe(5);
  });
});

// ════════════════════════════════════════════════════════════════
// createComment
// ════════════════════════════════════════════════════════════════
describe('createComment', () => {
  it('should throw 404 when article not found', async () => {
    mockArticle.findById.mockResolvedValue(null);
    await expect(commentService.createComment('bad', 'u1', 'hi')).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it('should create comment and populate user', async () => {
    mockArticle.findById.mockResolvedValue({ _id: 'art1' });
    const fakeComment = { populate: jest.fn().mockResolvedValue({ content: 'hi', user: {} }) };
    mockComment.create.mockResolvedValue(fakeComment);

    const result = await commentService.createComment('art1', 'u1', 'hi');
    expect(mockComment.create).toHaveBeenCalledWith({
      article: 'art1',
      user: 'u1',
      content: 'hi',
    });
  });
});

// ════════════════════════════════════════════════════════════════
// updateComment
// ════════════════════════════════════════════════════════════════
describe('updateComment', () => {
  it('should throw 404 when comment not found', async () => {
    mockComment.findById.mockResolvedValue(null);
    await expect(commentService.updateComment('bad', 'u1', 'new')).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it('should throw 403 when user is not the owner', async () => {
    mockComment.findById.mockResolvedValue({ user: 'other' });
    await expect(commentService.updateComment('c1', 'u1', 'new')).rejects.toMatchObject({
      statusCode: 403,
    });
  });

  it('should update comment when user is owner', async () => {
    const fakeComment = {
      user: 'u1',
      content: 'old',
      save: jest.fn().mockResolvedValue(),
      populate: jest.fn().mockResolvedValue({ content: 'new' }),
    };
    mockComment.findById.mockResolvedValue(fakeComment);

    await commentService.updateComment('c1', 'u1', 'new');
    expect(fakeComment.content).toBe('new');
    expect(fakeComment.save).toHaveBeenCalled();
  });
});

// ════════════════════════════════════════════════════════════════
// deleteComment
// ════════════════════════════════════════════════════════════════
describe('deleteComment', () => {
  it('should throw 404 when comment not found', async () => {
    mockComment.findById.mockResolvedValue(null);
    await expect(commentService.deleteComment('bad', 'u1', 'user')).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it('should throw 403 when non-owner non-admin tries to delete', async () => {
    mockComment.findById.mockResolvedValue({ user: 'other' });
    await expect(commentService.deleteComment('c1', 'u1', 'user')).rejects.toMatchObject({
      statusCode: 403,
    });
  });

  it('should allow owner to delete', async () => {
    mockComment.findById.mockResolvedValue({ user: 'u1' });
    mockComment.findByIdAndDelete.mockResolvedValue({});

    const result = await commentService.deleteComment('c1', 'u1', 'user');
    expect(result.message).toBeDefined();
  });

  it('should allow admin to delete any comment', async () => {
    mockComment.findById.mockResolvedValue({ user: 'other' });
    mockComment.findByIdAndDelete.mockResolvedValue({});

    const result = await commentService.deleteComment('c1', 'u1', 'admin');
    expect(result.message).toBeDefined();
  });
});
