// authorRequestService exports: createRequest, listRequests, handleRequest
const mockAuthorRequest = {
  findOne: jest.fn(),
  findById: jest.fn(),
  find: jest.fn(),
  countDocuments: jest.fn(),
  create: jest.fn(),
};
const mockUser = {
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
};

jest.mock('../../../src/models/AuthorRequest', () => mockAuthorRequest);
jest.mock('../../../src/models/User', () => mockUser);

const authorRequestService = require('../../../src/services/authorRequestService');

afterEach(() => jest.clearAllMocks());

// ── chain helper for find().populate().sort().skip().limit() ──
const chainable = (result) => {
  const chain = {};
  chain.populate = jest.fn().mockReturnValue(chain);
  chain.sort = jest.fn().mockReturnValue(chain);
  chain.skip = jest.fn().mockReturnValue(chain);
  chain.limit = jest.fn().mockResolvedValue(result);
  return chain;
};

// ════════════════════════════════════════════════════════════════
// createRequest
// ════════════════════════════════════════════════════════════════
describe('createRequest', () => {
  it('should throw 400 when pending request already exists', async () => {
    mockAuthorRequest.findOne.mockResolvedValue({ status: 'pending' });
    await expect(authorRequestService.createRequest('u1', 'reason')).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it('should throw 400 when user is already author', async () => {
    mockAuthorRequest.findOne.mockResolvedValue(null);
    mockUser.findById.mockResolvedValue({ role: 'author' });
    await expect(authorRequestService.createRequest('u1', 'reason')).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it('should create a new request for eligible user', async () => {
    mockAuthorRequest.findOne.mockResolvedValue(null);
    mockUser.findById.mockResolvedValue({ role: 'user' });
    const fakeReq = { populate: jest.fn().mockResolvedValue({ user: 'u1', reason: 'r' }) };
    mockAuthorRequest.create.mockResolvedValue(fakeReq);

    const result = await authorRequestService.createRequest('u1', 'I write well');
    expect(mockAuthorRequest.create).toHaveBeenCalledWith({ user: 'u1', reason: 'I write well' });
  });
});

// ════════════════════════════════════════════════════════════════
// listRequests
// ════════════════════════════════════════════════════════════════
describe('listRequests', () => {
  it('should return paginated requests', async () => {
    mockAuthorRequest.countDocuments.mockResolvedValue(15);
    const chain = chainable([{ user: 'u1' }]);
    mockAuthorRequest.find.mockReturnValue(chain);

    const result = await authorRequestService.listRequests({ page: 1, limit: 10 });
    expect(result.requests).toHaveLength(1);
    expect(result.pagination.total).toBe(15);
  });

  it('should filter by status', async () => {
    mockAuthorRequest.countDocuments.mockResolvedValue(0);
    const chain = chainable([]);
    mockAuthorRequest.find.mockReturnValue(chain);

    await authorRequestService.listRequests({ status: 'pending' });
    const filterArg = mockAuthorRequest.countDocuments.mock.calls[0][0];
    expect(filterArg.status).toBe('pending');
  });
});

// ════════════════════════════════════════════════════════════════
// handleRequest
// ════════════════════════════════════════════════════════════════
describe('handleRequest', () => {
  it('should throw 404 when request not found', async () => {
    const chain = { populate: jest.fn().mockResolvedValue(null) };
    mockAuthorRequest.findById.mockReturnValue(chain);
    await expect(authorRequestService.handleRequest('bad', 'approved')).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it('should throw 400 when request already processed', async () => {
    const chain = {
      populate: jest.fn().mockResolvedValue({ status: 'approved', save: jest.fn() }),
    };
    mockAuthorRequest.findById.mockReturnValue(chain);
    await expect(authorRequestService.handleRequest('req1', 'approved')).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it('should approve and upgrade user role to author', async () => {
    const fakeRequest = {
      status: 'pending',
      user: { _id: 'u1' },
      save: jest.fn().mockResolvedValue(),
    };
    const chain = { populate: jest.fn().mockResolvedValue(fakeRequest) };
    mockAuthorRequest.findById.mockReturnValue(chain);
    mockUser.findByIdAndUpdate.mockResolvedValue({});

    const result = await authorRequestService.handleRequest('req1', 'approved');
    expect(fakeRequest.status).toBe('approved');
    expect(mockUser.findByIdAndUpdate).toHaveBeenCalledWith('u1', { role: 'author' });
  });

  it('should reject without upgrading user role', async () => {
    const fakeRequest = {
      status: 'pending',
      user: { _id: 'u1' },
      save: jest.fn().mockResolvedValue(),
    };
    const chain = { populate: jest.fn().mockResolvedValue(fakeRequest) };
    mockAuthorRequest.findById.mockReturnValue(chain);

    const result = await authorRequestService.handleRequest('req1', 'rejected');
    expect(fakeRequest.status).toBe('rejected');
    expect(mockUser.findByIdAndUpdate).not.toHaveBeenCalled();
  });
});
