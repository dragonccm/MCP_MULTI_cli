import { Router } from 'express';
import { getSummary, getChartData } from '../controllers/stats.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.get('/summary', getSummary);
router.get('/chart', getChartData);

export default router;
