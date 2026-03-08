import { Response } from 'express';
import { CategoryService } from '../services';
import { AuthRequest } from '../middlewares/auth';

export class CategoryController {
  private categoryService = new CategoryService();

  getAll = async (req: AuthRequest, res: Response) => {
    try {
      const categories = await this.categoryService.getCategories(req.user!.id);
      res.json(categories);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ message });
    }
  };

  create = async (req: AuthRequest, res: Response) => {
    try {
      const { name, type } = req.body;
      if (!name || !type) {
        res.status(400).json({ message: 'Name and type are required' });
        return;
      }

      const category = await this.categoryService.createCategory({
        ...req.body,
        userId: req.user!.id
      });
      res.status(201).json(category);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(400).json({ message });
    }
  };
}
