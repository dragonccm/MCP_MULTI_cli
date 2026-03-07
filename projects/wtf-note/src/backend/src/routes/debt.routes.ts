import { Router } from "express";
import { debtController } from "../controllers/debt.controller";
import { validate } from "../middleware/validate";
import { authenticate } from "../middleware/auth";
import { createDebtSchema, updateDebtSchema, createDebtPaymentSchema } from "../validators/debt.validator";

const router = Router();

router.use(authenticate);

router.get("/", debtController.list);
router.get("/overview", debtController.getOverview);
router.get("/:id", debtController.getById);
router.post("/", validate(createDebtSchema), debtController.create);
router.put("/:id", validate(updateDebtSchema), debtController.update);
router.delete("/:id", debtController.delete);
router.post("/:debtId/payments", validate(createDebtPaymentSchema), debtController.addPayment);

export default router;
