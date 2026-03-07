import { Router } from "express";
import { settingsController } from "../controllers/settings.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

router.use(authenticate);

router.get("/export", settingsController.exportData);
router.post("/import", settingsController.importTransactions);
router.get("/backup", settingsController.getBackup);

export default router;
