import { userRepository } from '../repositories/user.repository';
import { hashPassword, comparePassword } from '../utils/password';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { AppError } from '../types';
import { RegisterInput, LoginInput } from '../validators/auth.validator';
import logger from '../utils/logger';

export class AuthService {
  async register(input: RegisterInput) {
    const existing = await userRepository.findByEmail(input.email);
    if (existing) {
      throw new AppError('Email already registered', 409);
    }

    const hashedPassword = await hashPassword(input.password);
    const user = await userRepository.create({
      email: input.email,
      password: hashedPassword,
      name: input.name,
      currency: input.currency || 'VND',
    });

    const tokenPayload = { userId: user.id, email: user.email };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    logger.info('User registered', { userId: user.id });

    return {
      user: { id: user.id, email: user.email, name: user.name, currency: user.currency },
      accessToken,
      refreshToken,
    };
  }

  async login(input: LoginInput) {
    const user = await userRepository.findByEmail(input.email);
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    const isValid = await comparePassword(input.password, user.password);
    if (!isValid) {
      throw new AppError('Invalid email or password', 401);
    }

    const tokenPayload = { userId: user.id, email: user.email };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    logger.info('User logged in', { userId: user.id });

    return {
      user: { id: user.id, email: user.email, name: user.name, currency: user.currency },
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(refreshTokenStr: string) {
    try {
      const payload = verifyRefreshToken(refreshTokenStr);
      const user = await userRepository.findById(payload.userId);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      const tokenPayload = { userId: user.id, email: user.email };
      const accessToken = generateAccessToken(tokenPayload);
      const newRefreshToken = generateRefreshToken(tokenPayload);

      return { accessToken, refreshToken: newRefreshToken };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Invalid refresh token', 401);
    }
  }

  async getProfile(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return { id: user.id, email: user.email, name: user.name, currency: user.currency, createdAt: user.createdAt };
  }
}

export const authService = new AuthService();
