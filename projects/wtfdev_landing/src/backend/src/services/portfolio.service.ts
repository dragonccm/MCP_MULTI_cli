import { portfolioRepository } from "../repositories/portfolio.repository.js";
import { NotFoundError } from "../utils/errors.js";
import type { PortfolioQueryInput } from "../utils/validators.js";

export const portfolioService = {
  async getProjects(filters: PortfolioQueryInput) {
    const { data, total } = await portfolioRepository.findAllPublished(filters);
    const categories = await portfolioRepository.getCategories();

    return {
      data,
      categories: categories.map((c) => c.name),
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total,
      },
    };
  },

  async getProjectById(id: string) {
    const project = await portfolioRepository.findById(id);
    if (!project) {
      throw new NotFoundError("Project not found or not published");
    }
    return project;
  },

  async getCategories() {
    const categories = await portfolioRepository.getCategories();
    return { categories };
  },
};
