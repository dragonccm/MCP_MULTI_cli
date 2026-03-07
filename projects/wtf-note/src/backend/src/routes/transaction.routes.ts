import { Router } from "express";
import { transactionController } from "../controllers/transaction.controller";
import { validate } from "../middleware/validate";
import { authenticate } from "../middleware/auth";
import {
  createTransactionSchema,
  updateTransactionSchema,
  listTransactionsSchema,
} from "../validators/transaction.validator";

const router = Router();

router.use(authenticate);

router.get("/", validate(listTransactionsSchema), transactionController.list);
router.get("/:id", transactionController.getById);
router.post("/", validate(createTransactionSchema), transactionController.create);
router.put("/:id", validate(updateTransactionSchema), transactionController.update);
router.delete("/:id", transactionController.delete);
router.post("/bulk-delete", transactionController.bulkDelete);

export default router;
