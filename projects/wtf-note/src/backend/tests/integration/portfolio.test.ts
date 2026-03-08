import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../src/app';
import { prisma } from '../setup';

describe('Portfolio API Integration Tests', () => {
  let accessToken: string;
  let userId: string;
  let portfolioId: string;
  let assetId: string;

  const testUser = {
    email: `portfoliotest_${Date.now()}@test.com`,
    password: 'testPassword123',
    name: 'Portfolio Test User',
    currency: 'VND',
  };

  beforeAll(async () => {
    // Register and login
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

    // Create a portfolio for testing
    const portfolioResponse = await request(app)
      .post('/api/portfolios')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'Test Portfolio' });

    portfolioId = portfolioResponse.body.data.id;
  });

  afterAll(async () => {
    // Cleanup is handled in setup.ts
  });

  describe('POST /api/portfolios', () => {
    it('should create a new portfolio', async () => {
      const response = await request(app)
        .post('/api/portfolios')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'Investment Portfolio 2024' })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Investment Portfolio 2024');
      expect(response.body.data.userId).toBe(userId);
    });

    it('should reject portfolio creation without auth', async () => {
      const response = await request(app)
        .post('/api/portfolios')
        .send({ name: 'Unauthorized Portfolio' })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should reject portfolio with empty name', async () => {
      const response = await request(app)
        .post('/api/portfolios')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: '' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/portfolios', () => {
    it('should get all portfolios for user', async () => {
      const response = await request(app)
        .get('/api/portfolios')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should reject without authentication', async () => {
      const response = await request(app)
        .get('/api/portfolios')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/portfolios/:id/assets', () => {
    it('should add a stock asset to portfolio', async () => {
      const asset = {
        symbol: 'AAPL',
        name: 'Apple Inc.',
        type: 'stock',
        quantity: 10,
        purchasePrice: 150.50,
        purchaseDate: '2024-01-15',
        currency: 'USD',
      };

      const response = await request(app)
        .post(`/api/portfolios/${portfolioId}/assets`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(asset)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.symbol).toBe('AAPL');
      expect(response.body.data.type).toBe('stock');

      assetId = response.body.data.id;
    });

    it('should add a crypto asset to portfolio', async () => {
      const asset = {
        symbol: 'BTC',
        name: 'Bitcoin',
        type: 'crypto',
        quantity: 0.5,
        purchasePrice: 40000,
        purchaseDate: '2024-01-20',
        currency: 'USD',
      };

      const response = await request(app)
        .post(`/api/portfolios/${portfolioId}/assets`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(asset)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.type).toBe('crypto');
    });

    it('should reject asset with invalid type', async () => {
      const asset = {
        symbol: 'INVALID',
        type: 'not_a_valid_type',
        quantity: 10,
        purchasePrice: 100,
        purchaseDate: '2024-01-15',
      };

      const response = await request(app)
        .post(`/api/portfolios/${portfolioId}/assets`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(asset)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should reject asset with negative quantity', async () => {
      const asset = {
        symbol: 'TEST',
        type: 'stock',
        quantity: -10,
        purchasePrice: 100,
        purchaseDate: '2024-01-15',
      };

      const response = await request(app)
        .post(`/api/portfolios/${portfolioId}/assets`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(asset)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should reject without authentication', async () => {
      const response = await request(app)
        .post(`/api/portfolios/${portfolioId}/assets`)
        .send({
          symbol: 'TEST',
          type: 'stock',
          quantity: 10,
          purchasePrice: 100,
          purchaseDate: '2024-01-15',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/portfolios/:id/assets', () => {
    it('should get all assets in portfolio', async () => {
      const response = await request(app)
        .get(`/api/portfolios/${portfolioId}/assets`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should reject without authentication', async () => {
      const response = await request(app)
        .get(`/api/portfolios/${portfolioId}/assets`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/portfolios/assets/:id', () => {
    it('should update an asset', async () => {
      const updates = {
        quantity: 15,
        purchasePrice: 160,
      };

      const response = await request(app)
        .put(`/api/portfolios/assets/${assetId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updates)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.quantity).toBe(15);
    });

    it('should reject update with invalid quantity', async () => {
      const updates = {
        quantity: -5,
      };

      const response = await request(app)
        .put(`/api/portfolios/assets/${assetId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updates)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should reject update without authentication', async () => {
      const response = await request(app)
        .put(`/api/portfolios/assets/${assetId}`)
        .send({ quantity: 20 })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/portfolios/assets/:id', () => {
    it('should delete an asset', async () => {
      // First create a test asset
      const createResponse = await request(app)
        .post(`/api/portfolios/${portfolioId}/assets`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          symbol: 'DEL',
          name: 'Delete Me',
          type: 'stock',
          quantity: 1,
          purchasePrice: 10,
          purchaseDate: '2024-01-15',
        });

      const testAssetId = createResponse.body.data.id;

      // Then delete it
      const response = await request(app)
        .delete(`/api/portfolios/assets/${testAssetId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should reject delete without authentication', async () => {
      const response = await request(app)
        .delete(`/api/portfolios/assets/${assetId}`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/portfolios/summary', () => {
    it('should get portfolio summary', async () => {
      const response = await request(app)
        .get('/api/portfolios/summary')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.totalValue).toBeDefined();
    });

    it('should reject without authentication', async () => {
      const response = await request(app)
        .get('/api/portfolios/summary')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});
