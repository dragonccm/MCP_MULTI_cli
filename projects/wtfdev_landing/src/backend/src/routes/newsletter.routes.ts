import { Router } from "express";
import { newsletterController } from "../controllers/newsletter.controller.js";
import { newsletterRateLimiter } from "../middleware/rateLimiter.js";

const router = Router();

router.post("/subscribe", newsletterRateLimiter, newsletterController.subscribe);
router.post("/unsubscribe", newsletterController.unsubscribe);

export default router;
