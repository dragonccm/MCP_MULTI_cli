import prisma from './prisma';
import { User } from '@prisma/client';

export class UserRepository {
  async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  }

  async create(data: Omit<User, 'id'>) {
    return prisma.user.create({ data });
  }
}
