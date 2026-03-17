// ── Mock models ──────────────────────────────────────────────
const mockUser = {
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  find: jest.fn(),
  countDocuments: jest.fn(),
};

const mockArticle = {
  countDocuments: jest.fn(),
  find: jest.fn(),
};

jest.mock('../../../src/models/User', () => mockUser);
jest.mock('../../../src/models/Article', () => mockArticle);

const userService = require('../../../src/services/userService');

afterEach(() => jest.clearAllMocks());

// ── Helpers ──────────────────────────────────────────────────
const chainable = (result) => {
  const chain = {};
  chain.populate = jest.fn().mockReturnValue(chain);
  chain.sort = jest.fn().mockReturnValue(chain);
  chain.skip = jest.fn().mockReturnValue(chain);
  chain.limit = jest.fn().mockResolvedValue(result);
  chain.select = jest.fn().mockReturnValue(chain);
  return chain;
};

// ════════════════════════════════════════════════════════════════
// getProfile
// ════════════════════════════════════════════════════════════════
describe('getProfile', () => {
  it('should return user profile with counts', async () => {
    const fakeUser = {
      _id: 'u1',
      name: 'Test',
      followers: ['f1', 'f2'],
      following: ['f3'],
      toJSON: () => ({ _id: 'u1', name: 'Test', followers: ['f1', 'f2'], following: ['f3'] }),
    };
    mockUser.findById.mockResolvedValue(fakeUser);
    mockArticle.countDocuments.mockResolvedValue(5);

    const result = await userService.getProfile('u1');
    expect(result.articleCount).toBe(5);
    expect(result.followersCount).toBe(2);
    expect(result.followingCount).toBe(1);
  });

  it('should throw 404 when user not found', async () => {
    mockUser.findById.mockResolvedValue(null);
    await expect(userService.getProfile('bad')).rejects.toMatchObject({ statusCode: 404 });
  });
});

// ════════════════════════════════════════════════════════════════
// updateProfile
// ════════════════════════════════════════════════════════════════
describe('updateProfile', () => {
  it('should update only allowed fields', async () => {
    mockUser.findByIdAndUpdate.mockResolvedValue({ name: 'New Name' });

    const result = await userService.updateProfile('u1', {
      name: 'New Name',
      role: 'admin', // should be ignored
    });

    const updateArg = mockUser.findByIdAndUpdate.mock.calls[0][1];
    expect(updateArg.name).toBe('New Name');
    expect(updateArg.role).toBeUndefined();
  });

  it('should throw 404 when user not found', async () => {
    mockUser.findByIdAndUpdate.mockResolvedValue(null);
    await expect(userService.updateProfile('bad', { name: 'X' })).rejects.toMatchObject({
      statusCode: 404,
    });
  });
});

// ════════════════════════════════════════════════════════════════
// changePassword
// ════════════════════════════════════════════════════════════════
describe('changePassword', () => {
  it('should throw 404 when user not found', async () => {
    const chain = { select: jest.fn().mockResolvedValue(null) };
    mockUser.findById.mockReturnValue(chain);

    await expect(userService.changePassword('bad', 'old', 'new123')).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it('should throw 400 when current password is wrong', async () => {
    const fakeUser = { comparePassword: jest.fn().mockResolvedValue(false) };
    const chain = { select: jest.fn().mockResolvedValue(fakeUser) };
    mockUser.findById.mockReturnValue(chain);

    await expect(userService.changePassword('u1', 'wrong', 'new123')).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it('should throw 400 when new password is too short', async () => {
    const fakeUser = { comparePassword: jest.fn().mockResolvedValue(true) };
    const chain = { select: jest.fn().mockResolvedValue(fakeUser) };
    mockUser.findById.mockReturnValue(chain);

    await expect(userService.changePassword('u1', 'old', '12345')).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it('should change password successfully', async () => {
    const fakeUser = {
      comparePassword: jest.fn().mockResolvedValue(true),
      save: jest.fn().mockResolvedValue(),
      password: '',
    };
    const chain = { select: jest.fn().mockResolvedValue(fakeUser) };
    mockUser.findById.mockReturnValue(chain);

    const result = await userService.changePassword('u1', 'oldPass', 'newPass123');
    expect(fakeUser.password).toBe('newPass123');
    expect(fakeUser.save).toHaveBeenCalled();
    expect(result.message).toBeDefined();
  });
});

// ════════════════════════════════════════════════════════════════
// listUsers
// ════════════════════════════════════════════════════════════════
describe('listUsers', () => {
  it('should return paginated users', async () => {
    mockUser.countDocuments.mockResolvedValue(1);
    const chain = chainable([{ name: 'Test User' }]);
    mockUser.find.mockReturnValue(chain);

    const result = await userService.listUsers({ page: 1, limit: 20 });
    expect(result.users).toHaveLength(1);
    expect(result.pagination.total).toBe(1);
  });

  it('should apply search filter', async () => {
    mockUser.countDocuments.mockResolvedValue(0);
    const chain = chainable([]);
    mockUser.find.mockReturnValue(chain);

    await userService.listUsers({ search: 'john' });
    const countArg = mockUser.countDocuments.mock.calls[0][0];
    expect(countArg.$or).toBeDefined();
  });

  it('should apply role filter', async () => {
    mockUser.countDocuments.mockResolvedValue(0);
    const chain = chainable([]);
    mockUser.find.mockReturnValue(chain);

    await userService.listUsers({ role: 'author' });
    const countArg = mockUser.countDocuments.mock.calls[0][0];
    expect(countArg.role).toBe('author');
  });
});

// ════════════════════════════════════════════════════════════════
// toggleBan
// ════════════════════════════════════════════════════════════════
describe('toggleBan', () => {
  it('should throw 404 when user not found', async () => {
    mockUser.findById.mockResolvedValue(null);
    await expect(userService.toggleBan('bad')).rejects.toMatchObject({ statusCode: 404 });
  });

  it('should throw 400 when trying to ban admin', async () => {
    mockUser.findById.mockResolvedValue({ role: 'admin' });
    await expect(userService.toggleBan('admin1')).rejects.toMatchObject({ statusCode: 400 });
  });

  it('should toggle ban status', async () => {
    const fakeUser = { role: 'user', isBanned: false, save: jest.fn().mockResolvedValue() };
    mockUser.findById.mockResolvedValue(fakeUser);

    const result = await userService.toggleBan('u1');
    expect(result.isBanned).toBe(true);
    expect(fakeUser.save).toHaveBeenCalled();
  });
});
