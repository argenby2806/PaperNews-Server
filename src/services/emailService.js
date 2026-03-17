const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT, 10),
  secure: false, // true for 465, false for 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Send OTP verification email.
 */
const sendOtpEmail = async (to, otp, type = 'register') => {
  const subject =
    type === 'register'
      ? 'PaperNews — Xác thực tài khoản'
      : 'PaperNews — Đặt lại mật khẩu';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #1a1a2e; text-align: center;">PaperNews</h2>
      <p>Xin chào,</p>
      <p>${
        type === 'register'
          ? 'Cảm ơn bạn đã đăng ký. Vui lòng sử dụng mã OTP bên dưới để xác thực tài khoản:'
          : 'Bạn đã yêu cầu đặt lại mật khẩu. Vui lòng sử dụng mã OTP bên dưới:'
      }</p>
      <div style="text-align: center; margin: 30px 0;">
        <span style="
          font-size: 32px;
          font-weight: bold;
          letter-spacing: 8px;
          color: #1a1a2e;
          background: #f0f0f5;
          padding: 15px 30px;
          border-radius: 10px;
        ">${otp}</span>
      </div>
      <p style="color: #666; font-size: 14px;">Mã OTP có hiệu lực trong 5 phút.</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="color: #999; font-size: 12px; text-align: center;">
        Nếu bạn không yêu cầu hành động này, vui lòng bỏ qua email.
      </p>
    </div>
  `;

  await transporter.sendMail({
    from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
    to,
    subject,
    html,
  });
};

module.exports = { sendOtpEmail };
