const jwt = require('jsonwebtoken');

// ── Mock User model ────────────────────────────────────────────
const mockFindById = jest.fn();
jest.mock('../../../src/models/User', () => ({ findById: mockFindById }));

// ── Import middleware AFTER mocking ────────────────────────────
const { authenticate, authorize } = require('../../../src/middleware/auth');

// ── Helpers ────────────────────────────────────────────────────
const SECRET = 'test-access-secret';

const buildReq = (token) => ({
  headers: { authorization: token ? `Bearer ${token}` : undefined },
});

const buildRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const nextFn = jest.fn();

beforeAll(() => {
  process.env.JWT_ACCESS_SECRET = SECRET;
});

afterEach(() => jest.clearAllMocks());

// ════════════════════════════════════════════════════════════════
// authenticate
// ════════════════════════════════════════════════════════════════
describe('authenticate middleware', () => {
  it('should return 401 when no Authorization header', async () => {
    const req = { headers: {} };
    const res = buildRes();
    await authenticate(req, res, nextFn);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(nextFn).not.toHaveBeenCalled();
  });

  it('should return 401 when token does not start with Bearer', async () => {
    const req = { headers: { authorization: 'Token abc' } };
    const res = buildRes();
    await authenticate(req, res, nextFn);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('should return 401 for an invalid token', async () => {
    const req = buildReq('invalid.jwt.token');
    const res = buildRes();
    await authenticate(req, res, nextFn);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('should return 401 when user is not found', async () => {
    const token = jwt.sign({ userId: 'user123' }, SECRET, { expiresIn: '1h' });
    mockFindById.mockResolvedValue(null);

    const req = buildReq(token);
    const res = buildRes();
    await authenticate(req, res, nextFn);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(nextFn).not.toHaveBeenCalled();
  });

  it('should return 403 when user is banned', async () => {
    const token = jwt.sign({ userId: 'user123' }, SECRET, { expiresIn: '1h' });
    mockFindById.mockResolvedValue({ _id: 'user123', isBanned: true });

    const req = buildReq(token);
    const res = buildRes();
    await authenticate(req, res, nextFn);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(nextFn).not.toHaveBeenCalled();
  });

  it('should attach user and call next() for a valid token', async () => {
    const fakeUser = { _id: 'user123', name: 'Test', isBanned: false };
    const token = jwt.sign({ userId: 'user123' }, SECRET, { expiresIn: '1h' });
    mockFindById.mockResolvedValue(fakeUser);

    const req = buildReq(token);
    const res = buildRes();
    await authenticate(req, res, nextFn);

    expect(req.user).toEqual(fakeUser);
    expect(nextFn).toHaveBeenCalled();
  });

  it('should return 401 when token is expired', async () => {
    const token = jwt.sign({ userId: 'user123' }, SECRET, { expiresIn: '0s' });

    // Small delay to ensure expiry
    await new Promise((r) => setTimeout(r, 10));

    const req = buildReq(token);
    const res = buildRes();
    await authenticate(req, res, nextFn);

    expect(res.status).toHaveBeenCalledWith(401);
  });
});

// ════════════════════════════════════════════════════════════════
// authorize
// ════════════════════════════════════════════════════════════════
describe('authorize middleware', () => {
  it('should call next() when user role is in the allowed list', () => {
    const req = { user: { role: 'admin' } };
    const res = buildRes();
    const mw = authorize('admin', 'author');
    mw(req, res, nextFn);
    expect(nextFn).toHaveBeenCalled();
  });

  it('should return 403 when user role is NOT in the allowed list', () => {
    const req = { user: { role: 'user' } };
    const res = buildRes();
    const mw = authorize('admin');
    mw(req, res, nextFn);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(nextFn).not.toHaveBeenCalled();
  });

  it('should work with a single role argument', () => {
    const req = { user: { role: 'author' } };
    const res = buildRes();
    const mw = authorize('author');
    mw(req, res, nextFn);
    expect(nextFn).toHaveBeenCalled();
  });
});
