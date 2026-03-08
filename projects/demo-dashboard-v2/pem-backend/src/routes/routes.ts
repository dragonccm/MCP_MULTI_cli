import { Router, RequestHandler } from 'express';
import { AuthController, CategoryController, TransactionController } from '../controllers';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

const authController = new AuthController();
const categoryController = new CategoryController();
const transactionController = new TransactionController();

// Auth routes
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);

// Category routes
router.get('/categories', authMiddleware as RequestHandler, categoryController.getAll as RequestHandler);
router.post('/categories', authMiddleware as RequestHandler, categoryController.create as RequestHandler);

// Transaction routes
router.get('/transactions', authMiddleware as RequestHandler, transactionController.getAll as RequestHandler);
router.post('/transactions', authMiddleware as RequestHandler, transactionController.create as RequestHandler);
router.get('/dashboard/stats', authMiddleware as RequestHandler, transactionController.getStats as RequestHandler);

export default router;
