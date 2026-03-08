import { Router } from 'express';
import { profileController } from '../controllers/profile.controller';
import { authMiddleware } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { updateProfileSchema, createCategorySchema, updateCategorySchema, createBudgetSchema, updateBudgetSchema } from '../validators/profile.validator';
import { changePasswordSchema } from '../validators/auth.validator';

const router = Router();

router.use(authMiddleware);

// Profile
router.put('/', validate(updateProfileSchema), (req, res, next) => profileController.updateProfile(req, res, next));
router.put('/password', validate(changePasswordSchema), (req, res, next) => profileController.changePassword(req, res, next));
router.delete('/', (req, res, next) => profileController.deleteAccount(req, res, next));

// Categories
router.get('/categories', (req, res, next) => profileController.getCategories(req, res, next));
router.post('/categories', validate(createCategorySchema), (req, res, next) => profileController.createCategory(req, res, next));
router.put('/categories/:id', validate(updateCategorySchema), (req, res, next) => profileController.updateCategory(req, res, next));
router.delete('/categories/:id', (req, res, next) => profileController.deleteCategory(req, res, next));

// Budgets
router.get('/budgets', (req, res, next) => profileController.getBudgets(req, res, next));
router.post('/budgets', validate(createBudgetSchema), (req, res, next) => profileController.createBudget(req, res, next));
router.put('/budgets/:id', validate(updateBudgetSchema), (req, res, next) => profileController.updateBudget(req, res, next));
router.delete('/budgets/:id', (req, res, next) => profileController.deleteBudget(req, res, next));

export default router;
