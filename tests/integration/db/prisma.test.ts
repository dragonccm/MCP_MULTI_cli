import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import { execSync } from 'child_process';

describe('Prisma DB Integration', () => {
  let prisma: PrismaClient;

  beforeAll(async () => {
    // For these tests, we use the existing dev.db for simplicity in this environment
    // In a real project, we would use a separate test database
    prisma = new PrismaClient();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should be able to query the database', async () => {
    // Just a simple query to verify connection
    const userCount = await prisma.user.count();
    expect(typeof userCount).toBe('number');
  });

  it('should be able to create and delete a test lead', async () => {
    const testEmail = `test-${Date.now()}@example.com`;
    
    // Create
    const lead = await prisma.lead.create({
      data: {
        name: 'Test User',
        email: testEmail,
      },
    });
    expect(lead.id).toBeDefined();
    expect(lead.email).toBe(testEmail);

    // Find
    const found = await prisma.lead.findUnique({
      where: { id: lead.id },
    });
    expect(found).toBeDefined();

    // Delete
    await prisma.lead.delete({
      where: { id: lead.id },
    });

    const deleted = await prisma.lead.findUnique({
      where: { id: lead.id },
    });
    expect(deleted).toBeNull();
  });
});
