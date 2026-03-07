import { Router } from "express";
import contactRoutes from "./contact.routes.js";
import newsletterRoutes from "./newsletter.routes.js";
import portfolioRoutes from "./portfolio.routes.js";
import serviceRoutes from "./service.routes.js";

const router = Router();

router.use("/contact", contactRoutes);
router.use("/newsletter", newsletterRoutes);
router.use("/portfolio", portfolioRoutes);
router.use("/services", serviceRoutes);

// Health check
router.get("/health", (_req, res) => {
  res.json({ success: true, message: "API is running", timestamp: new Date().toISOString() });
});

export default router;
