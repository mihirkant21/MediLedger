const { z } = require('zod');

const registerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().optional(),
  role: z.enum(['user', 'doctor', 'admin']).optional(),
});

const verifyOtpSchema = z.object({
  email: z.string().email('Invalid email address'),
  otp: z.string().min(1, 'OTP is required'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const googleLoginSchema = z.object({
  credential: z.string().min(1, 'Google credential is required'),
});

module.exports = {
  registerSchema,
  verifyOtpSchema,
  loginSchema,
  googleLoginSchema,
};
