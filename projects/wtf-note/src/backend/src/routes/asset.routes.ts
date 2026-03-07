import { Router } from "express";
import { assetController } from "../controllers/asset.controller";
import { validate } from "../middleware/validate";
import { authenticate } from "../middleware/auth";
import { createAssetSchema, updateAssetSchema } from "../validators/asset.validator";

const router = Router();

router.use(authenticate);

router.get("/", assetController.list);
router.get("/portfolio", assetController.getPortfolioOverview);
router.get("/:id", assetController.getById);
router.post("/", validate(createAssetSchema), assetController.create);
router.put("/:id", validate(updateAssetSchema), assetController.update);
router.delete("/:id", assetController.delete);

export default router;
