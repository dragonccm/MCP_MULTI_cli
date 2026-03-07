import { Router } from "express";
import { portfolioController } from "../controllers/portfolio.controller.js";

const router = Router();

router.get("/categories", portfolioController.getCategories);
router.get("/:id", portfolioController.getById);
router.get("/", portfolioController.getAll);

export default router;
