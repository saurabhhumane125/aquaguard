import twilio from 'twilio';

// Initialize unconditionally; if missing keys, the send logic will handle it using simulation
const client = twilio(process.env.TWILIO_ACCOUNT_SID || 'ACdummy', process.env.TWILIO_AUTH_TOKEN || 'dummy');

export class SmsService {
  static async sendOTP(phone: string, otp: string): Promise<void> {
    try {
      if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER || process.env.TWILIO_ACCOUNT_SID === 'your_account_sid') {
        console.log(`✅ [DEV] simulated SMS OTP sent to ${phone}: ${otp}`);
        return;
      }

      await client.messages.create({
        body: `Your AquaGuard Login OTP is: ${otp}. It is valid for 5 minutes.`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phone,
      });

      console.log(`✅ SMS OTP sent to ${phone}`);
    } catch (error) {
      console.error('❌ SMS sending failed:', error);
      throw new Error('Failed to send OTP SMS');
    }
  }
}
