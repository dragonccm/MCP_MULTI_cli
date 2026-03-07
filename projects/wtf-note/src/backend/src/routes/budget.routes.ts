import { Router } from "express";
import { budgetController } from "../controllers/budget.controller";
import { validate } from "../middleware/validate";
import { authenticate } from "../middleware/auth";
import { createBudgetSchema, updateBudgetSchema } from "../validators/budget.validator";

const router = Router();

router.use(authenticate);

router.get("/", budgetController.list);
router.get("/:id", budgetController.getById);
router.post("/", validate(createBudgetSchema), budgetController.create);
router.put("/:id", validate(updateBudgetSchema), budgetController.update);
router.delete("/:id", budgetController.delete);

export default router;
