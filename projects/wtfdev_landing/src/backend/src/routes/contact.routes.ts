import { Router } from "express";
import { contactController } from "../controllers/contact.controller.js";
import { adminAuth } from "../middleware/auth.js";
import { contactRateLimiter } from "../middleware/rateLimiter.js";

const router = Router();

router.post("/", contactRateLimiter, contactController.create);
router.get("/", adminAuth, contactController.getAll);

export default router;
