import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST } from '../../../src/backend/src/app/api/leads/route';
import { LeadService } from '@/services/lead.service';
import { NextRequest } from 'next/server';

// Mock LeadService
vi.mock('@/services/lead.service', () => ({
  LeadService: {
    getAllLeads: vi.fn(),
    createLead: vi.fn(),
  },
}));

describe('Leads API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET', () => {
    it('should return all leads', async () => {
      const mockLeads = [{ id: 1, name: 'Lead 1' }];
      (LeadService.getAllLeads as any).mockResolvedValue(mockLeads);

      const response = await GET();
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data).toEqual(mockLeads);
    });

    it('should handle errors', async () => {
      (LeadService.getAllLeads as any).mockRejectedValue(new Error('DB Error'));

      const response = await GET();
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body.success).toBe(false);
    });
  });

  describe('POST', () => {
    it('should create a lead successfully', async () => {
      const leadData = { name: 'John', email: 'john@test.com' };
      (LeadService.createLead as any).mockResolvedValue({ id: 1, ...leadData });

      const req = new NextRequest('http://localhost:3000/api/leads', {
        method: 'POST',
        body: JSON.stringify(leadData),
      });

      const response = await POST(req);
      const body = await response.json();

      expect(response.status).toBe(201);
      expect(body.success).toBe(true);
      expect(body.data.id).toBe(1);
    });

    it('should return 400 for validation errors', async () => {
      const { ZodError } = await import('zod');
      (LeadService.createLead as any).mockRejectedValue(new ZodError([]));

      const req = new NextRequest('http://localhost:3000/api/leads', {
        method: 'POST',
        body: JSON.stringify({ name: '' }),
      });

      const response = await POST(req);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.message).toBe('Dữ liệu không hợp lệ');
    });

    it('should return 500 for other errors', async () => {
      (LeadService.createLead as any).mockRejectedValue(new Error('Internal error'));

      const req = new NextRequest('http://localhost:3000/api/leads', {
        method: 'POST',
        body: JSON.stringify({ name: 'John' }),
      });

      const response = await POST(req);
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body.success).toBe(false);
    });
  });
});
