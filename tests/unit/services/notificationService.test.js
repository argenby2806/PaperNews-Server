// notificationService exports: createNotification, listNotifications, markAsRead, markAllAsRead
const mockNotification = {
  find: jest.fn(),
  countDocuments: jest.fn(),
  updateMany: jest.fn(),
  create: jest.fn(),
  findOneAndUpdate: jest.fn(),
};

jest.mock('../../../src/models/Notification', () => mockNotification);

const notificationService = require('../../../src/services/notificationService');

afterEach(() => jest.clearAllMocks());

// ── chain helper ─────────────────────────────────────────────
const chainable = (result) => {
  const chain = {};
  chain.sort = jest.fn().mockReturnValue(chain);
  chain.skip = jest.fn().mockReturnValue(chain);
  chain.limit = jest.fn().mockResolvedValue(result);
  return chain;
};

// ════════════════════════════════════════════════════════════════
// createNotification
// ════════════════════════════════════════════════════════════════
describe('createNotification', () => {
  it('should create a notification', async () => {
    const fakeNotif = { _id: 'n1', type: 'new_article', title: 'New!' };
    mockNotification.create.mockResolvedValue(fakeNotif);

    const result = await notificationService.createNotification({
      userId: 'u1',
      type: 'new_article',
      title: 'New!',
    });

    expect(mockNotification.create).toHaveBeenCalledWith({
      user: 'u1',
      type: 'new_article',
      title: 'New!',
      body: '',
      data: {},
    });
    expect(result).toEqual(fakeNotif);
  });
});

// ════════════════════════════════════════════════════════════════
// listNotifications
// ════════════════════════════════════════════════════════════════
describe('listNotifications', () => {
  it('should return paginated notifications with unread count', async () => {
    mockNotification.countDocuments
      .mockResolvedValueOnce(10)  // total
      .mockResolvedValueOnce(3); // unreadCount
    const chain = chainable([{ title: 'notif1' }]);
    mockNotification.find.mockReturnValue(chain);

    const result = await notificationService.listNotifications('u1', { page: 1, limit: 20 });
    expect(result.notifications).toHaveLength(1);
    expect(result.pagination.total).toBe(10);
    expect(result.unreadCount).toBe(3);
  });
});

// ════════════════════════════════════════════════════════════════
// markAsRead
// ════════════════════════════════════════════════════════════════
describe('markAsRead', () => {
  it('should mark a single notification as read', async () => {
    mockNotification.findOneAndUpdate.mockResolvedValue({
      _id: 'n1',
      isRead: true,
    });

    const result = await notificationService.markAsRead('n1', 'u1');
    expect(mockNotification.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: 'n1', user: 'u1' },
      { isRead: true },
      { new: true }
    );
    expect(result.isRead).toBe(true);
  });

  it('should throw 404 when notification not found', async () => {
    mockNotification.findOneAndUpdate.mockResolvedValue(null);
    await expect(notificationService.markAsRead('bogus', 'u1')).rejects.toMatchObject({
      statusCode: 404,
    });
  });
});

// ════════════════════════════════════════════════════════════════
// markAllAsRead
// ════════════════════════════════════════════════════════════════
describe('markAllAsRead', () => {
  it('should mark all unread notifications as read', async () => {
    mockNotification.updateMany.mockResolvedValue({ modifiedCount: 5 });

    const result = await notificationService.markAllAsRead('u1');
    expect(mockNotification.updateMany).toHaveBeenCalledWith(
      { user: 'u1', isRead: false },
      { isRead: true }
    );
    expect(result.message).toBeDefined();
  });
});
