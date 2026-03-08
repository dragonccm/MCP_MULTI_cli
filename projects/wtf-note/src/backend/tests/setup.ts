import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Setup test database
beforeAll(async () => {
  await prisma.$connect();
});

// Cleanup after all tests
afterAll(async () => {
  await prisma.$disconnect();
});

// Export prisma for use in tests
export { prisma };
