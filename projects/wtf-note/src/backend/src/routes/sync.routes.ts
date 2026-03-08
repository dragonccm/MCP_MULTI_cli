import { Router } from 'express';
import { syncController } from '../controllers/sync.controller';
import { authMiddleware } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { syncPushSchema } from '../validators/sync.validator';

const router = Router();

router.use(authMiddleware);

router.post('/push', validate(syncPushSchema), (req, res, next) => syncController.pushChanges(req, res, next));
router.get('/pull', (req, res, next) => syncController.pullChanges(req, res, next));
router.get('/status', (req, res, next) => syncController.getStatus(req, res, next));

export default router;
