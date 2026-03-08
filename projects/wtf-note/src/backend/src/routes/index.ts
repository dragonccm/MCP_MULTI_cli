import { Router } from 'express';
import authRoutes from './auth.routes';
import transactionRoutes from './transaction.routes';
import portfolioRoutes from './portfolio.routes';
import aiRoutes from './ai.routes';
import profileRoutes from './profile.routes';
import newsRoutes from './news.routes';
import syncRoutes from './sync.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/transactions', transactionRoutes);
router.use('/portfolios', portfolioRoutes);
router.use('/ai', aiRoutes);
router.use('/profile', profileRoutes);
router.use('/news', newsRoutes);
router.use('/sync', syncRoutes);

export default router;
