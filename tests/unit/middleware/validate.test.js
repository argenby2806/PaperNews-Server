// We need to test the validate middleware without a real express-validator stack.
// The middleware simply calls validationResult() and either forwards or returns 400.

const { validationResult } = require('express-validator');
const validate = require('../../../src/middleware/validate');

jest.mock('express-validator', () => ({
  validationResult: jest.fn(),
}));

const buildRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

afterEach(() => jest.clearAllMocks());

describe('validate middleware', () => {
  it('should call next() when there are no validation errors', () => {
    validationResult.mockReturnValue({ isEmpty: () => true, array: () => [] });

    const req = {};
    const res = buildRes();
    const next = jest.fn();
    validate(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('should return 400 with mapped errors when validation fails', () => {
    validationResult.mockReturnValue({
      isEmpty: () => false,
      array: () => [
        { path: 'email', msg: 'Email không hợp lệ' },
        { path: 'password', msg: 'Mật khẩu quá ngắn' },
      ],
    });

    const req = {};
    const res = buildRes();
    const next = jest.fn();
    validate(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Dữ liệu không hợp lệ',
      errors: [
        { field: 'email', message: 'Email không hợp lệ' },
        { field: 'password', message: 'Mật khẩu quá ngắn' },
      ],
    });
  });
});
