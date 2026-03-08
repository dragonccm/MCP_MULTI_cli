import { Router } from 'express';
import { transactionController } from '../controllers/transaction.controller';
import { authMiddleware } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createTransactionSchema, updateTransactionSchema, transactionFilterSchema } from '../validators/transaction.validator';

const router = Router();

router.use(authMiddleware);

router.post('/', validate(createTransactionSchema), (req, res, next) => transactionController.create(req, res, next));
router.get('/', validate(transactionFilterSchema, 'query'), (req, res, next) => transactionController.getMany(req, res, next));
router.get('/summary', (req, res, next) => transactionController.getSummary(req, res, next));
router.get('/:id', (req, res, next) => transactionController.getById(req, res, next));
router.put('/:id', validate(updateTransactionSchema), (req, res, next) => transactionController.update(req, res, next));
router.delete('/:id', (req, res, next) => transactionController.delete(req, res, next));

export default router;
