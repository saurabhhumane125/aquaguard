import { z } from 'zod';

export const emailSchema = z.string().email('Invalid email format');
export const phoneSchema = z.string().regex(/^[6-9]\d{9}$/, 'Invalid phone number');

export const otpRequestSchema = z.object({
  identifier: z.string(),
  type: z.enum(['email', 'phone'])
});

export const otpVerifySchema = z.object({
  identifier: z.string(),
  code: z.string().length(6, 'OTP must be 6 digits')
});

export const userUpdateSchema = z.object({
  name: z.string().min(2).max(50).optional(),
});

export const isValidEmail = (identifier: string): boolean => {
  return emailSchema.safeParse(identifier).success;
};

export const isValidPhone = (identifier: string): boolean => {
  return phoneSchema.safeParse(identifier).success;
};
