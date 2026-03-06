import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LeadService } from '@/services/lead.service';
import prisma from '@/lib/db';

// Mock prisma
vi.mock('@/lib/db', () => ({
  default: {
    lead: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

describe('LeadService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a lead with valid data', async () => {
    const leadData = {
      name: 'John Doe',
      email: 'john@example.com',
      company: 'WTF DEV',
    };

    (prisma.lead.create as any).mockResolvedValue({ id: 1, ...leadData });

    const result = await LeadService.createLead(leadData);

    expect(prisma.lead.create).toHaveBeenCalledWith({
      data: leadData,
    });
    expect(result.id).toBe(1);
  });

  it('should throw error with invalid data', async () => {
    const invalidData = {
      name: 'J', // too short
      email: 'invalid-email',
    };

    await expect(LeadService.createLead(invalidData)).rejects.toThrow();
    expect(prisma.lead.create).not.toHaveBeenCalled();
  });

  it('should return all leads', async () => {
    const mockLeads = [
      { id: 1, name: 'Lead 1' },
      { id: 2, name: 'Lead 2' },
    ];
    (prisma.lead.findMany as any).mockResolvedValue(mockLeads);

    const result = await LeadService.getAllLeads();

    expect(prisma.lead.findMany).toHaveBeenCalled();
    expect(result).toEqual(mockLeads);
  });
});
