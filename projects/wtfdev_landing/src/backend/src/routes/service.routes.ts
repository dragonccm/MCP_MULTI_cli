import { Router } from "express";
import { serviceController } from "../controllers/service.controller.js";

const router = Router();

router.get("/", serviceController.getAll);
router.get("/:slug", serviceController.getBySlug);

export default router;
