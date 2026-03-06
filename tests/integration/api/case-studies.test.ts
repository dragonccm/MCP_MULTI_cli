import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST } from '../../../src/backend/src/app/api/case-studies/route';
import { CaseStudyService } from '@/services/case-study.service';
import { NextRequest } from 'next/server';

vi.mock('@/services/case-study.service', () => ({
  CaseStudyService: {
    getAllCaseStudies: vi.fn(),
    createCaseStudy: vi.fn(),
  },
}));

describe('Case Studies API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('GET returns all case studies', async () => {
    const mockData = [{ id: 1, title: 'CS1' }];
    (CaseStudyService.getAllCaseStudies as any).mockResolvedValue(mockData);

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toEqual(mockData);
  });

  it('GET handles errors', async () => {
    (CaseStudyService.getAllCaseStudies as any).mockRejectedValue(new Error('Internal error'));
    const response = await GET();
    expect(response.status).toBe(500);
  });

  it('POST creates a case study', async () => {
    const data = { title: 'CS1', description: 'Desc for CS1' };
    (CaseStudyService.createCaseStudy as any).mockResolvedValue({ id: 1, ...data });

    const req = new NextRequest('http://localhost:3000/api/case-studies', {
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
    (CaseStudyService.createCaseStudy as any).mockRejectedValue(new ZodError([]));

    const req = new NextRequest('http://localhost:3000/api/case-studies', {
      method: 'POST',
      body: JSON.stringify({ title: '' }),
    });

    const response = await POST(req);
    expect(response.status).toBe(400);
  });

  it('POST returns 500 for other errors', async () => {
    (CaseStudyService.createCaseStudy as any).mockRejectedValue(new Error('Internal error'));

    const req = new NextRequest('http://localhost:3000/api/case-studies', {
      method: 'POST',
      body: JSON.stringify({ title: 'CS1' }),
    });

    const response = await POST(req);
    expect(response.status).toBe(500);
  });
});
