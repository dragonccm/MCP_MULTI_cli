import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../src/app';
import { prisma } from '../setup';

describe('Transaction API Integration Tests', () => {
  let accessToken: string;
  let userId: string;
  let createdTransactionId: string;

  const testUser = {
    email: `transactiontest_${Date.now()}@test.com`,
    password: 'testPassword123',
    name: 'Transaction Test User',
    currency: 'VND',
  };

  beforeAll(async () => {
    // Register and login to get access token
    await request(app)
      .post('/api/auth/register')
      .send(testUser);

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    accessToken = loginResponse.body.data.accessToken;
    userId = loginResponse.body.data.user.id;

    // Clean up any existing transactions for this user
    try {
      await prisma.transaction.deleteMany({
        where: { userId },
      });
    } catch (e) {
      // Table might not exist, that's ok
    }
  });

  afterAll(async () => {
    // Cleanup is handled in setup.ts
  });

  describe('POST /api/transactions', () => {
    it('should create an income transaction', async () => {
      const transaction = {
        type: 'income',
        amount: 5000000,
        currency: 'VND',
        description: 'Monthly salary',
        date: '2024-01-15',
        status: 'completed',
      };

      const response = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(transaction)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.type).toBe('income');
      expect(response.body.data.amount).toBe(5000000);
      expect(response.body.data.description).toBe('Monthly salary');

      createdTransactionId = response.body.data.id;
    });

    it('should create an expense transaction', async () => {
      const transaction = {
        type: 'expense',
        amount: 500000,
        currency: 'VND',
        description: 'Grocery shopping',
        date: '2024-01-16',
        status: 'completed',
      };

      const response = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(transaction)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.type).toBe('expense');
      expect(response.body.data.amount).toBe(500000);
    });

    it('should create a debt transaction', async () => {
      const transaction = {
        type: 'debt',
        amount: 2000000,
        currency: 'VND',
        description: 'Borrowed from friend',
        date: '2024-01-17',
        note: 'Return by end of month',
        status: 'pending',
      };

      const response = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(transaction)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.type).toBe('debt');
    });

    it('should create a receivable transaction', async () => {
      const transaction = {
        type: 'receivable',
        amount: 1000000,
        currency: 'VND',
        description: 'Lent to colleague',
        date: '2024-01-18',
        status: 'completed',
      };

      const response = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(transaction)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.type).toBe('receivable');
    });

    it('should reject transaction with negative amount', async () => {
      const transaction = {
        type: 'expense',
        amount: -100000,
        currency: 'VND',
        date: '2024-01-15',
      };

      const response = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(transaction)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should reject transaction without authentication', async () => {
      const transaction = {
        type: 'income',
        amount: 1000000,
        currency: 'VND',
        date: '2024-01-15',
      };

      const response = await request(app)
        .post('/api/transactions')
        .send(transaction)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/transactions', () => {
    it('should get all transactions for authenticated user', async () => {
      const response = await request(app)
        .get('/api/transactions')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should filter transactions by type', async () => {
      const response = await request(app)
        .get('/api/transactions?type=income')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      response.body.data.forEach((tx: any) => {
        expect(tx.type).toBe('income');
      });
    });

    it('should paginate transactions', async () => {
      const response = await request(app)
        .get('/api/transactions?page=1&limit=2')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeLessThanOrEqual(2);
    });

    it('should reject without authentication', async () => {
      const response = await request(app)
        .get('/api/transactions')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/transactions/:id', () => {
    it('should get a specific transaction by ID', async () => {
      const response = await request(app)
        .get(`/api/transactions/${createdTransactionId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(createdTransactionId);
    });

    it('should return 404 for non-existent transaction', async () => {
      const fakeId = '550e8400-e29b-41d4-a716-446655440000';
      const response = await request(app)
        .get(`/api/transactions/${fakeId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should reject without authentication', async () => {
      const response = await request(app)
        .get(`/api/transactions/${createdTransactionId}`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/transactions/:id', () => {
    it('should update a transaction', async () => {
      const updates = {
        amount: 6000000,
        description: 'Updated salary',
      };

      const response = await request(app)
        .put(`/api/transactions/${createdTransactionId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updates)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.amount).toBe(6000000);
      expect(response.body.data.description).toBe('Updated salary');
    });

    it('should reject update with invalid amount', async () => {
      const updates = {
        amount: -1000,
      };

      const response = await request(app)
        .put(`/api/transactions/${createdTransactionId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updates)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should reject update without authentication', async () => {
      const response = await request(app)
        .put(`/api/transactions/${createdTransactionId}`)
        .send({ amount: 1000 })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/transactions/:id', () => {
    it('should delete a transaction', async () => {
      // First create a transaction to delete
      const createResponse = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          type: 'expense',
          amount: 100000,
          currency: 'VND',
          date: '2024-01-20',
        });

      const txId = createResponse.body.data.id;

      // Then delete it
      const response = await request(app)
        .delete(`/api/transactions/${txId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify it's deleted
      const getResponse = await request(app)
        .get(`/api/transactions/${txId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });

    it('should reject delete without authentication', async () => {
      const response = await request(app)
        .delete(`/api/transactions/${createdTransactionId}`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/transactions/summary', () => {
    it('should get transaction summary', async () => {
      const response = await request(app)
        .get('/api/transactions/summary')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.totalIncome).toBeDefined();
      expect(response.body.data.totalExpense).toBeDefined();
      expect(response.body.data.balance).toBeDefined();
    });

    it('should reject without authentication', async () => {
      const response = await request(app)
        .get('/api/transactions/summary')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});
