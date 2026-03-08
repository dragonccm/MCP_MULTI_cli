import { Router } from 'express';
import { portfolioController } from '../controllers/portfolio.controller';
import { authMiddleware } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createPortfolioSchema, updatePortfolioSchema } from '../validators/portfolio.validator';
import { createAssetToPortfolioSchema, updateAssetSchema } from '../validators/portfolio.validator';

const router = Router();

router.use(authMiddleware);

// Static routes first
router.get('/summary', (req, res, next) => portfolioController.getPortfolioSummary(req, res, next));

// Dynamic routes
router.post('/', validate(createPortfolioSchema), (req, res, next) => portfolioController.createPortfolio(req, res, next));
router.get('/', (req, res, next) => portfolioController.getPortfolios(req, res, next));
router.get('/:id', (req, res, next) => portfolioController.getPortfolioById(req, res, next));
router.put('/:id', validate(updatePortfolioSchema), (req, res, next) => portfolioController.updatePortfolio(req, res, next));
router.delete('/:id', (req, res, next) => portfolioController.deletePortfolio(req, res, next));

// Asset routes - with portfolio ID in URL
router.post('/:id/assets', validate(createAssetToPortfolioSchema), (req, res, next) => portfolioController.addAssetToPortfolio(req, res, next));
router.get('/:id/assets', (req, res, next) => portfolioController.getAssetsByPortfolio(req, res, next));
router.put('/assets/:assetId', validate(updateAssetSchema), (req, res, next) => portfolioController.updateAsset(req, res, next));
router.delete('/assets/:assetId', (req, res, next) => portfolioController.deleteAsset(req, res, next));

export default router;
