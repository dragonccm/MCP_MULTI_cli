import { Router } from 'express';
import { getCategories, createCategory } from '../controllers/category.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.get('/', getCategories);
router.post('/', createCategory);

export default router;
