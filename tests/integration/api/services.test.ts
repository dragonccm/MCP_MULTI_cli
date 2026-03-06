import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST } from '../../../src/backend/src/app/api/services/route';
import { ServiceService } from '@/services/service.service';
import { NextRequest } from 'next/server';

vi.mock('@/services/service.service', () => ({
  ServiceService: {
    getAllServices: vi.fn(),
    createService: vi.fn(),
  },
}));

describe('Services API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('GET returns all services', async () => {
    const mockData = [{ id: 1, title: 'S1' }];
    (ServiceService.getAllServices as any).mockResolvedValue(mockData);

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toEqual(mockData);
  });

  it('GET handles errors', async () => {
    (ServiceService.getAllServices as any).mockRejectedValue(new Error('Internal error'));
    const response = await GET();
    expect(response.status).toBe(500);
  });

  it('POST creates a service', async () => {
    const data = { title: 'S1', description: 'Desc for S1', size: '1x1' };
    (ServiceService.createService as any).mockResolvedValue({ id: 1, ...data });

    const req = new NextRequest('http://localhost:3000/api/services', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    const response = await POST(req);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.data.id).toBe(1);
  });

  it('POST returns 400 for validation errors', async () => {
    const { ZodError } = await import('zod');
    (ServiceService.createService as any).mockRejectedValue(new ZodError([]));

    const req = new NextRequest('http://localhost:3000/api/services', {
      method: 'POST',
      body: JSON.stringify({ title: '' }),
    });

    const response = await POST(req);
    expect(response.status).toBe(400);
  });

  it('POST returns 500 for other errors', async () => {
    (ServiceService.createService as any).mockRejectedValue(new Error('Internal error'));

    const req = new NextRequest('http://localhost:3000/api/services', {
      method: 'POST',
      body: JSON.stringify({ title: 'S1' }),
    });

    const response = await POST(req);
    expect(response.status).toBe(500);
  });
});
