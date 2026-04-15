import { PrismaClient, User } from '@prisma/client';
import { generateOTP, getOTPExpiry, isOTPExpired } from '../utils/otp';
import { generateToken } from '../utils/jwt';
import { EmailService } from './email.service';
import { SmsService } from './sms.service';
import { isValidEmail, isValidPhone } from '../utils/validators';

const prisma = new PrismaClient();

export class AuthService {
  // Send OTP
  static async sendOTP(identifier: string, type: 'email' | 'phone'): Promise<{ success: boolean; message: string }> {
    try {
      // Validate identifier
      if (type === 'email' && !isValidEmail(identifier)) {
        throw new Error('Invalid email format');
      }
      if (type === 'phone' && !isValidPhone(identifier)) {
        throw new Error('Invalid phone number format');
      }

      // Generate OTP
      const otp = generateOTP();
      const expiresAt = getOTPExpiry();

      // Delete old OTPs for this identifier
      await prisma.oTP.deleteMany({
        where: { identifier }
      });

      // Store new OTP
      await prisma.oTP.create({
        data: { identifier, code: otp, expiresAt, verified: false }
      });

      // Send OTP based on type
      if (type === 'email') {
        await EmailService.sendOTP(identifier, otp);
      } else {
        await SmsService.sendOTP(identifier, otp);
      }

      return {
        success: true,
        message: `OTP sent to ${type === 'email' ? 'your email' : 'your phone'}`
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to send OTP');
    }
  }

  // Verify OTP and login/signup
  static async verifyOTP(identifier: string, code: string, name?: string): Promise<{ user: User; token: string; isNewUser: boolean; }> {
    try {
      // Find OTP
      const otpRecord = await prisma.oTP.findFirst({
        where: { identifier, code, verified: false },
        orderBy: { createdAt: 'desc' }
      });

      if (!otpRecord) {
        throw new Error('Invalid OTP');
      }

      // Check expiry
      if (isOTPExpired(otpRecord.expiresAt)) {
        throw new Error('OTP expired');
      }

      // Mark OTP as verified
      await prisma.oTP.update({
        where: { id: otpRecord.id },
        data: { verified: true }
      });

      // Check if user exists
      const isEmail = isValidEmail(identifier);
      let user = await prisma.user.findFirst({
        where: isEmail ? { email: identifier } : { phone: identifier }
      });

      let isNewUser = false;

      // Create user if doesn't exist
      if (!user) {
        isNewUser = true;
        user = await prisma.user.create({
          data: {
            email: isEmail ? identifier : undefined,
            phone: isEmail ? undefined : identifier,
            name: name || 'AquaGuard User',
            role: 'CITIZEN',
            points: 0,
            trustScore: 100.0
          }
        });

        // Send welcome email
        if (isEmail) {
          await EmailService.sendWelcomeEmail(identifier, user.name);
        }
      }

      // Generate JWT token
      const token = generateToken({
        userId: user.id,
        email: user.email || undefined,
        phone: user.phone || undefined,
        role: user.role
      });

      return { user, token, isNewUser };
    } catch (error: any) {
      throw new Error(error.message || 'OTP verification failed');
    }
  }

  // Get user profile
  static async getProfile(userId: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { id: userId },
      include: {
        leaksReported: { take: 5, orderBy: { createdAt: 'desc' } }
      }
    });
  }

  // Update user profile
  static async updateProfile(userId: string, data: { name?: string }): Promise<User> {
    return await prisma.user.update({
      where: { id: userId },
      data
    });
  }

  // Get Leaderboard
  static async getLeaderboard(): Promise<any[]> {
    const users = await prisma.user.findMany({
      where: { role: 'CITIZEN' },
      orderBy: { points: 'desc' },
      take: 100,
      select: {
        id: true,
        name: true,
        points: true,
        _count: {
          select: { leaksReported: true }
        }
      }
    });

    return users.map(user => {
      let badge = 'Observer';
      if (user.points >= 500) badge = 'Water Savior';
      else if (user.points >= 250) badge = 'Eco Warrior';
      else if (user.points >= 100) badge = 'Scout';

      return {
        id: user.id,
        name: user.name,
        points: user.points,
        leaksReported: user._count.leaksReported,
        badge
      };
    });
  }
}
