// ── Mock Category model ──────────────────────────────────────
const mockCategory = {
  find: jest.fn(),
  findOne: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
  create: jest.fn(),
};

jest.mock('../../../src/models/Category', () => mockCategory);

const categoryService = require('../../../src/services/categoryService');

afterEach(() => jest.clearAllMocks());

// ════════════════════════════════════════════════════════════════
// listCategories
// ════════════════════════════════════════════════════════════════
describe('listCategories', () => {
  it('should return categories sorted by name', async () => {
    const chain = { sort: jest.fn().mockResolvedValue([{ name: 'A' }, { name: 'B' }]) };
    mockCategory.find.mockReturnValue(chain);

    const result = await categoryService.listCategories();
    expect(result).toHaveLength(2);
    expect(chain.sort).toHaveBeenCalledWith({ name: 1 });
  });
});

// ════════════════════════════════════════════════════════════════
// createCategory
// ════════════════════════════════════════════════════════════════
describe('createCategory', () => {
  it('should create a category with generated slug', async () => {
    mockCategory.findOne.mockResolvedValue(null);
    mockCategory.create.mockResolvedValue({ name: 'Tech News', slug: 'tech-news' });

    const result = await categoryService.createCategory({ name: 'Tech News', description: '' });
    expect(result.slug).toBe('tech-news');
    expect(mockCategory.create).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Tech News', slug: 'tech-news' })
    );
  });

  it('should throw 409 when category already exists', async () => {
    mockCategory.findOne.mockResolvedValue({ name: 'Existing' });
    await expect(categoryService.createCategory({ name: 'Existing' })).rejects.toMatchObject({
      statusCode: 409,
    });
  });
});

// ════════════════════════════════════════════════════════════════
// updateCategory
// ════════════════════════════════════════════════════════════════
describe('updateCategory', () => {
  it('should update name and regenerate slug', async () => {
    mockCategory.findByIdAndUpdate.mockResolvedValue({ name: 'Sports', slug: 'sports' });

    const result = await categoryService.updateCategory('c1', { name: 'Sports' });
    expect(result.slug).toBe('sports');
  });

  it('should throw 404 when category not found', async () => {
    mockCategory.findByIdAndUpdate.mockResolvedValue(null);
    await expect(categoryService.updateCategory('bad', { name: 'X' })).rejects.toMatchObject({
      statusCode: 404,
    });
  });
});

// ════════════════════════════════════════════════════════════════
// deleteCategory
// ════════════════════════════════════════════════════════════════
describe('deleteCategory', () => {
  it('should delete and return message', async () => {
    mockCategory.findByIdAndDelete.mockResolvedValue({ _id: 'c1' });
    const result = await categoryService.deleteCategory('c1');
    expect(result.message).toBeDefined();
  });

  it('should throw 404 when category not found', async () => {
    mockCategory.findByIdAndDelete.mockResolvedValue(null);
    await expect(categoryService.deleteCategory('bad')).rejects.toMatchObject({ statusCode: 404 });
  });
});

// ════════════════════════════════════════════════════════════════
// findOrCreate
// ════════════════════════════════════════════════════════════════
describe('findOrCreate', () => {
  it('should return null for empty name', async () => {
    const result = await categoryService.findOrCreate('   ');
    expect(result).toBeNull();
  });

  it('should return existing category when found', async () => {
    const existing = { _id: 'c1', name: 'Tech' };
    mockCategory.findOne.mockResolvedValue(existing);

    const result = await categoryService.findOrCreate('Tech');
    expect(result).toEqual(existing);
    expect(mockCategory.create).not.toHaveBeenCalled();
  });

  it('should create new category when not found', async () => {
    mockCategory.findOne.mockResolvedValue(null);
    mockCategory.create.mockResolvedValue({ _id: 'c2', name: 'Science', slug: 'science' });

    const result = await categoryService.findOrCreate('Science');
    expect(mockCategory.create).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Science', slug: 'science' })
    );
  });
});
