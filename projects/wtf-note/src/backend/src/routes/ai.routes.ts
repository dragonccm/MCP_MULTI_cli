import { Router } from "express";
import { aiController } from "../controllers/ai.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

router.use(authenticate);

router.get("/spending-insights", aiController.getSpendingInsights);
router.get("/budget-recommendations", aiController.getBudgetRecommendations);
router.get("/net-worth-projection", aiController.getNetWorthProjection);
router.get("/history", aiController.getInsightHistory);

export default router;
