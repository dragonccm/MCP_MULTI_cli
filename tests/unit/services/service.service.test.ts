import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ServiceService } from '@/services/service.service';
import prisma from '@/lib/db';

// Mock prisma
vi.mock('@/lib/db', () => ({
  default: {
    service: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

describe('ServiceService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a service with valid data', async () => {
    const serviceData = {
      title: 'AI SEO',
      description: 'Automated SEO with AI power',
      size: '1x1',
      order: 1
    };

    (prisma.service.create as any).mockResolvedValue({ id: 1, ...serviceData });

    const result = await ServiceService.createService(serviceData);

    expect(prisma.service.create).toHaveBeenCalled();
    expect(result.id).toBe(1);
  });

  it('should return all services', async () => {
    const mockServices = [
      { id: 1, title: 'Service 1' },
      { id: 2, title: 'Service 2' },
    ];
    (prisma.service.findMany as any).mockResolvedValue(mockServices);

    const result = await ServiceService.getAllServices();

    expect(prisma.service.findMany).toHaveBeenCalled();
    expect(result).toEqual(mockServices);
  });
});
