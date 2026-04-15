import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { otpRequestSchema, otpVerifySchema, userUpdateSchema } from '../utils/validators';

export class AuthController {
  static async sendOTP(req: any, res: Response) {
    try {
      const { identifier, type } = otpRequestSchema.parse(req.body);
      const result = await AuthService.sendOTP(identifier, type);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async verifyOTP(req: any, res: Response) {
    try {
      const { identifier, code } = otpVerifySchema.parse(req.body);
      const { name } = req.body;
      const result = await AuthService.verifyOTP(identifier, code, name);

      res.json({
        success: true,
        isNewUser: result.isNewUser,
        user: {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          phone: result.user.phone,
          role: result.user.role,
          points: result.user.points,
          trustScore: result.user.trustScore
        },
        token: result.token
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async getProfile(req: any, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const user = await AuthService.getProfile(req.user.userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json({ user });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async updateProfile(req: any, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const data = userUpdateSchema.parse(req.body);
      const user = await AuthService.updateProfile(req.user.userId, data);
      res.json({ user });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async logout(req: any, res: Response) {
    res.json({ success: true, message: 'Logged out successfully' });
  }

  static async getLeaderboard(req: any, res: Response) {
    try {
      const leaderboard = await AuthService.getLeaderboard();
      res.json(leaderboard);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
