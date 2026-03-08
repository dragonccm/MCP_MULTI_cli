import { Request, Response, NextFunction } from 'express';
import { newsService } from '../services/news.service';
import { sendSuccess } from '../utils/apiResponse';

export class NewsController {
  async getNews(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      const symbols = req.query.symbols as string | undefined;
      const result = await newsService.getNews(limit, symbols);
      sendSuccess(res, result, 'News retrieved');
    } catch (error) {
      next(error);
    }
  }

  async refreshNews(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await newsService.refreshNews();
      sendSuccess(res, result, 'News refreshed');
    } catch (error) {
      next(error);
    }
  }
}

export const newsController = new NewsController();
