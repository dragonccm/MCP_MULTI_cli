import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../../../src/backend/src/app/api/auth/register/route';
import prisma from '@/lib/db';
import bcrypt from 'bcrypt';
import { NextRequest } from 'next/server';

// Mock Prisma
vi.mock('@/lib/db', () => ({
  default: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

// Mock Bcrypt
vi.mock('bcrypt', () => ({
  default: {
    hash: vi.fn().mockResolvedValue('hashed_password'),
    compare: vi.fn(),
  },
}));

describe('Auth API (Register)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should register a new user successfully', async () => {
    const userData = { email: 'new@test.com', password: 'password123' };
    (prisma.user.findUnique as any).mockResolvedValue(null);
    (prisma.user.create as any).mockResolvedValue({ id: 1, email: userData.email });

    const req = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    const response = await POST(req);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.success).toBe(true);
    expect(prisma.user.create).toHaveBeenCalled();
  });

  it('should return error if user already exists', async () => {
    const userData = { email: 'existing@test.com', password: 'password123' };
    (prisma.user.findUnique as any).mockResolvedValue({ id: 1, email: userData.email });

    const req = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    const response = await POST(req);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toBe('Người dùng đã tồn tại');
  });
});
