import { prisma } from "../config/database";
import { Prisma } from "@prisma/client";

export const userRepository = {
  findByEmail(email: string) {
    return prisma.user.findFirst({
      where: { email, deletedAt: null },
    });
  },

  findById(id: string) {
    return prisma.user.findFirst({
      where: { id, deletedAt: null },
    });
  },

  create(data: Prisma.UserCreateInput) {
    return prisma.user.create({ data });
  },

  update(id: string, data: Prisma.UserUpdateInput) {
    return prisma.user.update({ where: { id }, data });
  },

  incrementFailedLogins(id: string) {
    return prisma.user.update({
      where: { id },
      data: { failedLogins: { increment: 1 } },
    });
  },

  resetFailedLogins(id: string) {
    return prisma.user.update({
      where: { id },
      data: { failedLogins: 0, lockedUntil: null },
    });
  },

  lockAccount(id: string, until: Date) {
    return prisma.user.update({
      where: { id },
      data: { lockedUntil: until },
    });
  },

  softDelete(id: string) {
    return prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  },

  saveRefreshToken(userId: string, token: string, expiresAt: Date) {
    return prisma.refreshToken.create({
      data: { token, userId, expiresAt },
    });
  },

  findRefreshToken(token: string) {
    return prisma.refreshToken.findUnique({ where: { token } });
  },

  deleteRefreshToken(token: string) {
    return prisma.refreshToken.delete({ where: { token } });
  },

  deleteAllRefreshTokens(userId: string) {
    return prisma.refreshToken.deleteMany({ where: { userId } });
  },
};
