import { Router } from "express";
import { categoryController } from "../controllers/category.controller";
import { validate } from "../middleware/validate";
import { authenticate } from "../middleware/auth";
import { createCategorySchema, updateCategorySchema } from "../validators/category.validator";

const router = Router();

router.use(authenticate);

router.get("/", categoryController.list);
router.post("/", validate(createCategorySchema), categoryController.create);
router.put("/:id", validate(updateCategorySchema), categoryController.update);
router.delete("/:id", categoryController.delete);
router.post("/:id/reassign", categoryController.reassign);

export default router;
