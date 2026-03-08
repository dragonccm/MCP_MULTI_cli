import { Router } from 'express';
import { aiController } from '../controllers/ai.controller';
import { authMiddleware } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { spendingInsightsSchema, investmentAdviceSchema, budgetPlanningSchema } from '../validators/ai.validator';

const router = Router();

router.use(authMiddleware);

router.post('/spending-insights', validate(spendingInsightsSchema), (req, res, next) => aiController.getSpendingInsights(req, res, next));
router.post('/investment-advice', validate(investmentAdviceSchema), (req, res, next) => aiController.getInvestmentAdvice(req, res, next));
router.post('/budget-planning', validate(budgetPlanningSchema), (req, res, next) => aiController.getBudgetPlanning(req, res, next));

export default router;
