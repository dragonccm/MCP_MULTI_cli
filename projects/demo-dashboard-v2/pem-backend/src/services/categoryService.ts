import { CategoryRepository } from '../repositories';
import { Category } from '@prisma/client';

export class CategoryService {
  private categoryRepository = new CategoryRepository();

  async getCategories(userId: string) {
    return this.categoryRepository.getAllByUserId(userId);
  }

  async createCategory(data: Omit<Category, 'id'>) {
    return this.categoryRepository.create(data);
  }
}
