import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export class EmailService {
  static async sendOTP(email: string, otp: string): Promise<void> {
    try {
      if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
         console.log(`✅ [DEV] simulated OTP sent to ${email}: ${otp}`);
         return;
      }
      await transporter.sendMail({
        from: `"AquaGuard" <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'Your AquaGuard Login OTP',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; }
              .container { background: white; padding: 30px; border-radius: 10px; max-width: 500px; margin: 0 auto; }
              .header { text-align: center; color: #0091ea; }
              .otp { font-size: 48px; font-weight: bold; color: #0091ea; text-align: center; letter-spacing: 8px; margin: 30px 0; }
              .footer { text-align: center; color: #666; font-size: 14px; margin-top: 30px; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1 class="header">🌊 AquaGuard</h1>
              <p>Hello,</p>
              <p>Your One-Time Password (OTP) for login is:</p>
              <div class="otp">${otp}</div>
              <p>This OTP is valid for <strong>5 minutes</strong>.</p>
              <p>If you didn't request this, please ignore this email.</p>
              <div class="footer">
                <p>Together, let's save every drop! 💧</p>
                <p style="color: #999; font-size: 12px;">AquaGuard - Smart Water Leak Management</p>
              </div>
            </div>
          </body>
          </html>
        `
      });
      console.log(`✅ OTP sent to ${email}`);
    } catch (error) {
      console.error('❌ Email sending failed:', error);
      throw new Error('Failed to send OTP email');
    }
  }

  static async sendWelcomeEmail(email: string, name: string): Promise<void> {
    try {
      if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
         return;
      }
      await transporter.sendMail({
        from: `"AquaGuard" <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'Welcome to AquaGuard! 🌊',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; }
              .container { background: white; padding: 30px; border-radius: 10px; max-width: 500px; margin: 0 auto; }
              .header { text-align: center; color: #0091ea; }
              .button { background: #0091ea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1 class="header">🌊 Welcome to AquaGuard!</h1>
              <p>Hi ${name},</p>
              <p>Thank you for joining AquaGuard - India's first AI-powered water leak reporting platform!</p>
              <p>You can now:</p>
              <ul>
                <li>📸 Report water leaks in your area</li>
                <li>🏆 Earn points and badges</li>
                <li>📊 Track real-time impact</li>
                <li>🌍 Save water, save money!</li>
              </ul>
              <p style="text-align: center;">
                <a href="${process.env.FRONTEND_URL}" class="button">Start Reporting</a>
              </p>
              <p>Every drop counts! 💧</p>
            </div>
          </body>
          </html>
        `
      });
    } catch (error) {
      console.error('❌ Welcome email failed:', error);
    }
  }
}
