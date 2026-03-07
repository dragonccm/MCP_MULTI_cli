import { serviceRepository } from "../repositories/service.repository.js";
import { NotFoundError } from "../utils/errors.js";

export const serviceService = {
  async getAll(includeInactive: boolean) {
    const data = await serviceRepository.findAll(includeInactive);
    return { data };
  },

  async getBySlug(slug: string) {
    const service = await serviceRepository.findBySlug(slug);
    if (!service) {
      throw new NotFoundError("Service not found");
    }
    return service;
  },
};
