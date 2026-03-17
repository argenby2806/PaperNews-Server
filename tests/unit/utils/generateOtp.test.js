const generateOtp = require('../../../src/utils/generateOtp');

describe('generateOtp', () => {
  it('should return a string', () => {
    expect(typeof generateOtp()).toBe('string');
  });

  it('should return a 6-digit code', () => {
    const otp = generateOtp();
    expect(otp).toHaveLength(6);
    expect(/^\d{6}$/.test(otp)).toBe(true);
  });

  it('should return a code between 100000 and 999999', () => {
    for (let i = 0; i < 100; i++) {
      const num = Number(generateOtp());
      expect(num).toBeGreaterThanOrEqual(100000);
      expect(num).toBeLessThanOrEqual(999999);
    }
  });

  it('should produce varying codes (not always the same)', () => {
    const codes = new Set();
    for (let i = 0; i < 20; i++) {
      codes.add(generateOtp());
    }
    // Extremely unlikely that 20 calls produce the same code
    expect(codes.size).toBeGreaterThan(1);
  });
});
