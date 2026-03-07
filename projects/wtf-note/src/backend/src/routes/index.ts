import { Router } from "express";
import authRoutes from "./auth.routes";
import categoryRoutes from "./category.routes";
import transactionRoutes from "./transaction.routes";
import debtRoutes from "./debt.routes";
import assetRoutes from "./asset.routes";
import budgetRoutes from "./budget.routes";
import dashboardRoutes from "./dashboard.routes";
import marketRoutes from "./market.routes";
import aiRoutes from "./ai.routes";
import settingsRoutes from "./settings.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/categories", categoryRoutes);
router.use("/transactions", transactionRoutes);
router.use("/debts", debtRoutes);
router.use("/assets", assetRoutes);
router.use("/budgets", budgetRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/market", marketRoutes);
router.use("/ai", aiRoutes);
router.use("/settings", settingsRoutes);

export default router;
