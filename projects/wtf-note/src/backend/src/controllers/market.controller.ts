import { Response, NextFunction } from "express";
import { marketService } from "../services/market.service";
import { sendSuccess } from "../utils/apiResponse";
import { AuthRequest } from "../types";

export const marketController = {
  async refreshStocks(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const prices = await marketService.refreshStockPrices(req.user!.userId);
      sendSuccess(res, prices, "Stock prices refreshed");
    } catch (error) {
      next(error);
    }
  },

  async refreshCrypto(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const prices = await marketService.refreshCryptoPrices(req.user!.userId);
      sendSuccess(res, prices, "Crypto prices refreshed");
    } catch (error) {
      next(error);
    }
  },

  async refreshAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const [stocks, crypto] = await Promise.all([
        marketService.refreshStockPrices(req.user!.userId),
        marketService.refreshCryptoPrices(req.user!.userId),
      ]);
      sendSuccess(res, {
        stocksUpdated: stocks.length,
        cryptoUpdated: crypto.length,
        stocks,
        crypto,
        lastUpdated: new Date().toISOString(),
      }, "All market data refreshed");
    } catch (error) {
      next(error);
    }
  },

  async getCachedPrices(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const type = req.query.type as string | undefined;
      const prices = await marketService.getCachedPrices(type);
      sendSuccess(res, prices, "Cached prices retrieved");
    } catch (error) {
      next(error);
    }
  },

  async getPriceBySymbol(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const symbol = req.params.symbol as string;
      const type = req.params.type as string;
      const price = await marketService.getPriceBySymbol(symbol, type);
      if (!price) {
        res.status(404).json({ success: false, message: "Price not found" });
        return;
      }
      sendSuccess(res, price, "Price retrieved");
    } catch (error) {
      next(error);
    }
  },
};
