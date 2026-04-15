import { Request } from 'express';

export interface JWTPayload {
  userId: string;
  email?: string;
  phone?: string;
  role: string;
}

export interface AuthRequest extends Request {
  user?: JWTPayload;
}

export interface OTPRequest {
  identifier: string; // email or phone
  type: 'email' | 'phone';
}

export interface OTPVerify {
  identifier: string;
  code: string;
}

export interface UserResponse {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: string;
  points: number;
  trustScore: number;
  token: string;
}
