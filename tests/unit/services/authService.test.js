const jwt = require('jsonwebtoken');

// ── Mock models & utilities ──────────────────────────────────
const mockUser = {
  findOne: jest.fn(),
  findOneAndUpdate: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
};
const mockOtp = {
  findOne: jest.fn(),
  deleteMany: jest.fn(),
  create: jest.fn(),
};
const mockArticle = {
  countDocuments: jest.fn(),
};

jest.mock('../../../src/models/User', () => mockUser);
jest.mock('../../../src/models/Otp', () => mockOtp);
jest.mock('../../../src/models/Article', () => mockArticle);
jest.mock('../../../src/services/emailService', () => ({
  sendOtpEmail: jest.fn().mockResolvedValue(),
}));
jest.mock('../../../src/utils/generateOtp', () => jest.fn().mockReturnValue('123456'));

// ── Set env vars before importing ────────────────────────────
process.env.JWT_ACCESS_SECRET = 'test-access-secret';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
process.env.JWT_RESET_SECRET = 'test-reset-secret';

const authService = require('../../../src/services/authService');

afterEach(() => jest.clearAllMocks());

// ════════════════════════════════════════════════════════════════
// register
// ════════════════════════════════════════════════════════════════
describe('register', () => {
  it('should throw 409 when email already exists', async () => {
    mockUser.findOne.mockResolvedValue({ email: 'existing@test.com' });
    await expect(
      authService.register({ email: 'existing@test.com', password: '123456', name: 'Test' })
    ).rejects.toMatchObject({ statusCode: 409 });
  });

  it('should create user and send OTP (no tokens yet)', async () => {
    mockUser.findOne.mockResolvedValue(null);
    mockUser.create.mockResolvedValue({ _id: 'u1', email: 'new@test.com' });
    mockOtp.deleteMany.mockResolvedValue();
    mockOtp.create.mockResolvedValue();

    const result = await authService.register({
      email: 'new@test.com',
      password: '123456',
      name: 'Test',
    });

    expect(result.userId).toBe('u1');
    expect(result.message).toBeDefined();
    // Should NOT return tokens — tokens issued after OTP verification
    expect(result.accessToken).toBeUndefined();
  });
});

// ════════════════════════════════════════════════════════════════
// verifyOtp
// ════════════════════════════════════════════════════════════════
describe('verifyOtp', () => {
  it('should throw 400 when OTP is invalid', async () => {
    mockOtp.findOne.mockResolvedValue(null);
    await expect(authService.verifyOtp({ email: 'x@x.com', otp: '000000' })).rejects.toMatchObject(
      { statusCode: 400 }
    );
  });

  it('should verify, issue tokens, and return user', async () => {
    mockOtp.findOne.mockResolvedValue({ email: 'x@x.com', code: '123456' });
    mockUser.findOneAndUpdate.mockResolvedValue({
      _id: 'u1',
      email: 'x@x.com',
      isVerified: true,
    });
    mockOtp.deleteMany.mockResolvedValue();

    const result = await authService.verifyOtp({ email: 'x@x.com', otp: '123456' });
    expect(result.accessToken).toBeDefined();
    expect(result.refreshToken).toBeDefined();
    expect(result.user._id).toBe('u1');
  });
});

// ════════════════════════════════════════════════════════════════
// login
// ════════════════════════════════════════════════════════════════
describe('login', () => {
  it('should throw 401 when user not found', async () => {
    const chain = { select: jest.fn().mockResolvedValue(null) };
    mockUser.findOne.mockReturnValue(chain);
    await expect(authService.login({ email: 'no@x.com', password: '123' })).rejects.toMatchObject({
      statusCode: 401,
    });
  });

  it('should throw 403 when user is not verified', async () => {
    const chain = {
      select: jest.fn().mockResolvedValue({
        isVerified: false,
        isBanned: false,
        comparePassword: jest.fn(),
      }),
    };
    mockUser.findOne.mockReturnValue(chain);
    await expect(
      authService.login({ email: 'x@x.com', password: '123' })
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  it('should throw 403 when user is banned', async () => {
    const chain = {
      select: jest.fn().mockResolvedValue({
        isVerified: true,
        isBanned: true,
        comparePassword: jest.fn(),
      }),
    };
    mockUser.findOne.mockReturnValue(chain);
    await expect(
      authService.login({ email: 'x@x.com', password: '123' })
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  it('should throw 401 when password is wrong', async () => {
    const chain = {
      select: jest.fn().mockResolvedValue({
        isVerified: true,
        isBanned: false,
        comparePassword: jest.fn().mockResolvedValue(false),
      }),
    };
    mockUser.findOne.mockReturnValue(chain);
    await expect(
      authService.login({ email: 'x@x.com', password: 'wrong' })
    ).rejects.toMatchObject({ statusCode: 401 });
  });

  it('should return tokens on successful login', async () => {
    const fakeUser = {
      _id: 'u1',
      email: 'x@x.com',
      isVerified: true,
      isBanned: false,
      followers: ['f1'],
      following: ['f2', 'f3'],
      comparePassword: jest.fn().mockResolvedValue(true),
      toJSON: () => ({ _id: 'u1', email: 'x@x.com' }),
    };
    const chain = { select: jest.fn().mockResolvedValue(fakeUser) };
    mockUser.findOne.mockReturnValue(chain);
    mockArticle.countDocuments.mockResolvedValue(10);

    const result = await authService.login({ email: 'x@x.com', password: 'correct' });
    expect(result.accessToken).toBeDefined();
    expect(result.refreshToken).toBeDefined();
    expect(result.user.articleCount).toBe(10);
    expect(result.user.followersCount).toBe(1);
    expect(result.user.followingCount).toBe(2);
  });
});

// ════════════════════════════════════════════════════════════════
// refreshAccessToken
// ════════════════════════════════════════════════════════════════
describe('refreshAccessToken', () => {
  it('should throw 401 when token is invalid', async () => {
    await expect(
      authService.refreshAccessToken({ refreshToken: 'bad-token' })
    ).rejects.toMatchObject({ statusCode: 401 });
  });

  it('should return new access token on valid refresh', async () => {
    const token = jwt.sign({ userId: 'u1' }, 'test-refresh-secret', { expiresIn: '7d' });
    mockUser.findById.mockResolvedValue({ _id: 'u1', isBanned: false });

    const result = await authService.refreshAccessToken({ refreshToken: token });
    expect(result.accessToken).toBeDefined();

    const payload = jwt.verify(result.accessToken, 'test-access-secret');
    expect(payload.userId).toBe('u1');
  });

  it('should throw 401 when user is banned', async () => {
    const token = jwt.sign({ userId: 'u1' }, 'test-refresh-secret', { expiresIn: '7d' });
    mockUser.findById.mockResolvedValue({ _id: 'u1', isBanned: true });

    await expect(
      authService.refreshAccessToken({ refreshToken: token })
    ).rejects.toMatchObject({ statusCode: 401 });
  });
});

// ════════════════════════════════════════════════════════════════
// forgotPassword
// ════════════════════════════════════════════════════════════════
describe('forgotPassword', () => {
  it('should send OTP and return message', async () => {
    mockUser.findOne.mockResolvedValue({ _id: 'u1', email: 'x@x.com' });
    mockOtp.deleteMany.mockResolvedValue();
    mockOtp.create.mockResolvedValue();

    const result = await authService.forgotPassword({ email: 'x@x.com' });
    expect(result.message).toBeDefined();
  });

  it('should still return success message when email not found (security)', async () => {
    mockUser.findOne.mockResolvedValue(null);
    const result = await authService.forgotPassword({ email: 'no@x.com' });
    expect(result.message).toBeDefined();
  });
});

// ════════════════════════════════════════════════════════════════
// resetPassword
// ════════════════════════════════════════════════════════════════
describe('resetPassword', () => {
  it('should throw 400 when reset token is invalid', async () => {
    await expect(
      authService.resetPassword({ resetToken: 'bad', newPassword: 'abc123' })
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it('should reset password with valid token', async () => {
    const token = jwt.sign({ email: 'x@x.com' }, 'test-reset-secret', { expiresIn: '10m' });
    const fakeUser = { password: 'old', save: jest.fn().mockResolvedValue() };
    mockUser.findOne.mockResolvedValue(fakeUser);

    const result = await authService.resetPassword({ resetToken: token, newPassword: 'new123' });
    expect(fakeUser.password).toBe('new123');
    expect(fakeUser.save).toHaveBeenCalled();
    expect(result.message).toBeDefined();
  });
});
