import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CaseStudyService } from '@/services/case-study.service';
import prisma from '@/lib/db';

// Mock prisma
vi.mock('@/lib/db', () => ({
  default: {
    caseStudy: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

describe('CaseStudyService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a case study with valid data', async () => {
    const data = {
      title: 'E-commerce Growth',
      description: 'Helping a brand scale to 1M users',
    };

    (prisma.caseStudy.create as any).mockResolvedValue({ id: 1, ...data });

    const result = await CaseStudyService.createCaseStudy(data);

    expect(prisma.caseStudy.create).toHaveBeenCalled();
    expect(result.id).toBe(1);
  });

  it('should return all case studies', async () => {
    const mockData = [{ id: 1, title: 'CS 1' }];
    (prisma.caseStudy.findMany as any).mockResolvedValue(mockData);

    const result = await CaseStudyService.getAllCaseStudies();

    expect(prisma.caseStudy.findMany).toHaveBeenCalled();
    expect(result).toEqual(mockData);
  });
});
