import { Router } from "express";
import { marketController } from "../controllers/market.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

router.use(authenticate);

router.post("/stocks/refresh", marketController.refreshStocks);
router.post("/crypto/refresh", marketController.refreshCrypto);
router.post("/refresh-all", marketController.refreshAll);
router.get("/prices", marketController.getCachedPrices);
router.get("/prices/:type/:symbol", marketController.getPriceBySymbol);

export default router;
