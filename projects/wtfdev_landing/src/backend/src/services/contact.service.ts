import { contactRepository } from "../repositories/contact.repository.js";
import type { CreateContactInput, ContactQueryInput } from "../utils/validators.js";

export const contactService = {
  async submitInquiry(data: CreateContactInput) {
    const inquiry = await contactRepository.create(data);
    return {
      id: inquiry.id,
      name: inquiry.name,
      email: inquiry.email,
      message: inquiry.message,
      company: inquiry.company,
      phone: inquiry.phone,
      service_interest: inquiry.service_interest,
      status: inquiry.status,
      created_at: inquiry.created_at.toISOString(),
    };
  },

  async getInquiries(filters: ContactQueryInput) {
    const { data, total } = await contactRepository.findAll(filters);
    const totalPages = Math.ceil(total / filters.limit);

    return {
      data: data.map((item) => ({
        id: item.id,
        name: item.name,
        email: item.email,
        message: item.message,
        company: item.company,
        phone: item.phone,
        service_interest: item.service_interest,
        status: item.status,
        created_at: item.created_at.toISOString(),
      })),
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total,
        total_pages: totalPages,
      },
    };
  },
};
