// ── Mock mongoose models ─────────────────────────────────────
const mockArticle = {
  find: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
  countDocuments: jest.fn(),
  create: jest.fn(),
};

const mockCategory = {
  findByIdAndUpdate: jest.fn(),
};

jest.mock('../../../src/models/Article', () => mockArticle);
jest.mock('../../../src/models/Category', () => mockCategory);
jest.mock('../../../src/services/categoryService', () => ({
  findOrCreate: jest.fn(),
}));

const articleService = require('../../../src/services/articleService');
const categoryService = require('../../../src/services/categoryService');

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
// listArticles
// ════════════════════════════════════════════════════════════════
describe('listArticles', () => {
  it('should return paginated articles', async () => {
    const fakeArticles = [{ title: 'A1' }, { title: 'A2' }];
    mockArticle.countDocuments.mockResolvedValue(2);

    const chain = chainable(fakeArticles);
    mockArticle.find.mockReturnValue(chain);

    const result = await articleService.listArticles({ page: 1, limit: 10 });

    expect(result.articles).toEqual(fakeArticles);
    expect(result.pagination.total).toBe(2);
    expect(result.pagination.totalPages).toBe(1);
  });

  it('should apply search filter', async () => {
    mockArticle.countDocuments.mockResolvedValue(0);
    const chain = chainable([]);
    mockArticle.find.mockReturnValue(chain);

    await articleService.listArticles({ search: 'hello' });

    const findArg = mockArticle.find.mock.calls[0][0];
    expect(findArg.$text).toEqual({ $search: 'hello' });
  });

  it('should apply category and featured filters', async () => {
    mockArticle.countDocuments.mockResolvedValue(0);
    const chain = chainable([]);
    mockArticle.find.mockReturnValue(chain);

    await articleService.listArticles({ category: 'cat1', featured: 'true' });

    const findArg = mockArticle.find.mock.calls[0][0];
    expect(findArg.category).toBe('cat1');
    expect(findArg.isFeatured).toBe(true);
  });
});

// ════════════════════════════════════════════════════════════════
// getArticleById
// ════════════════════════════════════════════════════════════════
describe('getArticleById', () => {
  it('should return article and increment view count', async () => {
    const fakeArticle = { _id: 'a1', title: 'Test' };
    const chain = { populate: jest.fn() };
    chain.populate.mockReturnValueOnce(chain).mockReturnValueOnce(fakeArticle);
    mockArticle.findByIdAndUpdate.mockReturnValue(chain);

    const result = await articleService.getArticleById('a1');

    expect(result).toEqual(fakeArticle);
    expect(mockArticle.findByIdAndUpdate).toHaveBeenCalledWith(
      'a1',
      { $inc: { viewCount: 1 } },
      { new: true }
    );
  });

  it('should throw 404 when article not found', async () => {
    const chain = { populate: jest.fn() };
    chain.populate.mockReturnValueOnce(chain).mockReturnValueOnce(null);
    mockArticle.findByIdAndUpdate.mockReturnValue(chain);

    await expect(articleService.getArticleById('bad-id')).rejects.toMatchObject({
      statusCode: 404,
    });
  });
});

// ════════════════════════════════════════════════════════════════
// createArticle
// ════════════════════════════════════════════════════════════════
describe('createArticle', () => {
  it('should create an article and update category count', async () => {
    const fakeArticle = {
      _id: 'a1',
      title: 'New',
      category: 'cat1',
      populate: jest.fn().mockResolvedValue({ _id: 'a1', title: 'New' }),
    };
    mockArticle.create.mockResolvedValue(fakeArticle);
    mockCategory.findByIdAndUpdate.mockResolvedValue({});

    const data = { title: 'New', content: 'body', category: 'cat1', status: 'published' };
    const result = await articleService.createArticle(data, 'author1');

    expect(mockArticle.create).toHaveBeenCalled();
    expect(mockCategory.findByIdAndUpdate).toHaveBeenCalledWith('cat1', { $inc: { articleCount: 1 } });
  });

  it('should auto-resolve categoryName when category is not provided', async () => {
    categoryService.findOrCreate.mockResolvedValue({ _id: 'cat99' });
    const fakeArticle = { populate: jest.fn().mockResolvedValue({}) };
    mockArticle.create.mockResolvedValue(fakeArticle);
    mockCategory.findByIdAndUpdate.mockResolvedValue({});

    const data = { title: 'X', content: 'body', categoryName: 'Tech' };
    await articleService.createArticle(data, 'author1');

    expect(categoryService.findOrCreate).toHaveBeenCalledWith('Tech');
  });

  it('should auto-generate excerpt when not provided', async () => {
    const fakeArticle = { populate: jest.fn().mockResolvedValue({}) };
    mockArticle.create.mockResolvedValue(fakeArticle);

    const data = { title: 'X', content: '# Hello world', category: 'c1' };
    await articleService.createArticle(data, 'author1');

    const createArg = mockArticle.create.mock.calls[0][0];
    expect(createArg.excerpt).toBeDefined();
    expect(createArg.excerpt).not.toContain('#');
  });
});

// ════════════════════════════════════════════════════════════════
// updateArticle
// ════════════════════════════════════════════════════════════════
describe('updateArticle', () => {
  it('should throw 404 when article not found', async () => {
    mockArticle.findById.mockResolvedValue(null);
    await expect(articleService.updateArticle('bad', {}, 'u1')).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it('should throw 403 when user is not the owner', async () => {
    mockArticle.findById.mockResolvedValue({ author: 'other-user', category: 'c1' });
    await expect(articleService.updateArticle('a1', {}, 'u1')).rejects.toMatchObject({
      statusCode: 403,
    });
  });

  it('should update article when user is the owner', async () => {
    mockArticle.findById.mockResolvedValue({ author: 'u1', category: 'c1' });
    const chain = { populate: jest.fn() };
    chain.populate.mockReturnValueOnce(chain).mockReturnValueOnce({ _id: 'a1' });
    mockArticle.findByIdAndUpdate.mockReturnValue(chain);

    const result = await articleService.updateArticle('a1', { title: 'Updated' }, 'u1');
    expect(mockArticle.findByIdAndUpdate).toHaveBeenCalled();
  });

  it('should set publishedAt when status changes to published', async () => {
    mockArticle.findById.mockResolvedValue({ author: 'u1', category: 'c1', status: 'draft' });
    const chain = { populate: jest.fn() };
    chain.populate.mockReturnValueOnce(chain).mockReturnValueOnce({ _id: 'a1' });
    mockArticle.findByIdAndUpdate.mockReturnValue(chain);

    await articleService.updateArticle('a1', { status: 'published' }, 'u1');

    const updateArg = mockArticle.findByIdAndUpdate.mock.calls[0][1];
    expect(updateArg.publishedAt).toBeInstanceOf(Date);
  });
});

// ════════════════════════════════════════════════════════════════
// deleteArticle
// ════════════════════════════════════════════════════════════════
describe('deleteArticle', () => {
  it('should throw 404 when article not found', async () => {
    mockArticle.findById.mockResolvedValue(null);
    await expect(articleService.deleteArticle('bad', 'u1', 'user')).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it('should throw 403 when non-owner non-admin tries to delete', async () => {
    mockArticle.findById.mockResolvedValue({ author: 'other', category: 'c1' });
    await expect(articleService.deleteArticle('a1', 'u1', 'user')).rejects.toMatchObject({
      statusCode: 403,
    });
  });

  it('should allow owner to delete', async () => {
    mockArticle.findById.mockResolvedValue({ author: 'u1', category: 'c1' });
    mockArticle.findByIdAndDelete.mockResolvedValue({});
    mockCategory.findByIdAndUpdate.mockResolvedValue({});

    const result = await articleService.deleteArticle('a1', 'u1', 'user');
    expect(result.message).toBeDefined();
    expect(mockArticle.findByIdAndDelete).toHaveBeenCalledWith('a1');
  });

  it('should allow admin to delete any article', async () => {
    mockArticle.findById.mockResolvedValue({ author: 'other', category: 'c1' });
    mockArticle.findByIdAndDelete.mockResolvedValue({});
    mockCategory.findByIdAndUpdate.mockResolvedValue({});

    const result = await articleService.deleteArticle('a1', 'u1', 'admin');
    expect(result.message).toBeDefined();
  });
});

// ════════════════════════════════════════════════════════════════
// updateArticleStatus
// ════════════════════════════════════════════════════════════════
describe('updateArticleStatus', () => {
  it('should throw 404 when article not found', async () => {
    const chain = { populate: jest.fn() };
    chain.populate.mockReturnValueOnce(chain).mockReturnValueOnce(null);
    mockArticle.findByIdAndUpdate.mockReturnValue(chain);

    await expect(
      articleService.updateArticleStatus('bad', { status: 'published' })
    ).rejects.toMatchObject({ statusCode: 404 });
  });

  it('should set publishedAt when approving', async () => {
    const chain = { populate: jest.fn() };
    chain.populate.mockReturnValueOnce(chain).mockReturnValueOnce({ _id: 'a1' });
    mockArticle.findByIdAndUpdate.mockReturnValue(chain);

    await articleService.updateArticleStatus('a1', { status: 'published' });

    const updateArg = mockArticle.findByIdAndUpdate.mock.calls[0][1];
    expect(updateArg.publishedAt).toBeInstanceOf(Date);
    expect(updateArg.rejectReason).toBe('');
  });

  it('should set rejectReason when rejecting', async () => {
    const chain = { populate: jest.fn() };
    chain.populate.mockReturnValueOnce(chain).mockReturnValueOnce({ _id: 'a1' });
    mockArticle.findByIdAndUpdate.mockReturnValue(chain);

    await articleService.updateArticleStatus('a1', { status: 'rejected', rejectReason: 'Spam' });

    const updateArg = mockArticle.findByIdAndUpdate.mock.calls[0][1];
    expect(updateArg.rejectReason).toBe('Spam');
  });
});

// ════════════════════════════════════════════════════════════════
// toggleFeatured
// ════════════════════════════════════════════════════════════════
describe('toggleFeatured', () => {
  it('should throw 404 when article not found', async () => {
    mockArticle.findById.mockResolvedValue(null);
    await expect(articleService.toggleFeatured('bad')).rejects.toMatchObject({ statusCode: 404 });
  });

  it('should toggle isFeatured from false to true', async () => {
    const fakeArticle = { isFeatured: false, save: jest.fn().mockResolvedValue() };
    mockArticle.findById.mockResolvedValue(fakeArticle);

    const result = await articleService.toggleFeatured('a1');
    expect(result.isFeatured).toBe(true);
    expect(fakeArticle.save).toHaveBeenCalled();
  });

  it('should toggle isFeatured from true to false', async () => {
    const fakeArticle = { isFeatured: true, save: jest.fn().mockResolvedValue() };
    mockArticle.findById.mockResolvedValue(fakeArticle);

    const result = await articleService.toggleFeatured('a1');
    expect(result.isFeatured).toBe(false);
  });
});
