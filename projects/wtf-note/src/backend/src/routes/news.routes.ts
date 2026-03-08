import { Router } from 'express';
import { newsController } from '../controllers/news.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.get('/', (req, res, next) => newsController.getNews(req, res, next));
router.post('/refresh', (req, res, next) => newsController.refreshNews(req, res, next));

export default router;
