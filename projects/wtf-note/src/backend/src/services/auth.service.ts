import bcrypt from "bcryptjs";
import { userRepository } from "../repositories/user.repository";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../utils/jwt";
import { createAppError } from "../middleware/errorHandler";

const SALT_ROUNDS = 12;
const MAX_FAILED_LOGINS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000;

export const authService = {
  async register(email: string, password: string, name: string) {
    const existing = await userRepository.findByEmail(email);
    if (existing) {
      throw createAppError("Email already registered", 409);
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await userRepository.create({
      email,
      password: hashedPassword,
      name,
    });

    const accessToken = generateAccessToken({ userId: user.id, email: user.email });
    const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await userRepository.saveRefreshToken(user.id, refreshToken, expiresAt);

    return {
      user: sanitizeUser(user),
      accessToken,
      refreshToken,
    };
  },

  async login(email: string, password: string) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw createAppError("Invalid email or password", 401);
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const remainingMs = user.lockedUntil.getTime() - Date.now();
      const remainingMin = Math.ceil(remainingMs / 60000);
      throw createAppError(`Account locked. Try again in ${remainingMin} minutes`, 423);
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      const updated = await userRepository.incrementFailedLogins(user.id);
      if (updated.failedLogins >= MAX_FAILED_LOGINS) {
        await userRepository.lockAccount(user.id, new Date(Date.now() + LOCK_DURATION_MS));
      }
      throw createAppError("Invalid email or password", 401);
    }

    await userRepository.resetFailedLogins(user.id);

    const accessToken = generateAccessToken({ userId: user.id, email: user.email });
    const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await userRepository.saveRefreshToken(user.id, refreshToken, expiresAt);

    return {
      user: sanitizeUser(user),
      accessToken,
      refreshToken,
    };
  },

  async refreshToken(token: string) {
    const stored = await userRepository.findRefreshToken(token);
    if (!stored || stored.expiresAt < new Date()) {
      throw createAppError("Invalid or expired refresh token", 401);
    }

    const payload = verifyRefreshToken(token);
    const user = await userRepository.findById(payload.userId);
    if (!user) {
      throw createAppError("User not found", 404);
    }

    await userRepository.deleteRefreshToken(token);

    const accessToken = generateAccessToken({ userId: user.id, email: user.email });
    const newRefreshToken = generateRefreshToken({ userId: user.id, email: user.email });

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await userRepository.saveRefreshToken(user.id, newRefreshToken, expiresAt);

    return { accessToken, refreshToken: newRefreshToken };
  },

  async logout(userId: string) {
    await userRepository.deleteAllRefreshTokens(userId);
  },

  async getProfile(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw createAppError("User not found", 404);
    }
    return sanitizeUser(user);
  },

  async updateProfile(userId: string, data: { name?: string; currency?: string; locale?: string }) {
    const user = await userRepository.update(userId, data);
    return sanitizeUser(user);
  },

  async changePassword(userId: string, oldPassword: string, newPassword: string) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw createAppError("User not found", 404);
    }

    const valid = await bcrypt.compare(oldPassword, user.password);
    if (!valid) {
      throw createAppError("Current password is incorrect", 401);
    }

    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await userRepository.update(userId, { password: hashedPassword });
    await userRepository.deleteAllRefreshTokens(userId);
  },
};

function sanitizeUser(user: { id: string; email: string; name: string; currency: string; locale: string; createdAt: Date }) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    currency: user.currency,
    locale: user.locale,
    createdAt: user.createdAt,
  };
}
