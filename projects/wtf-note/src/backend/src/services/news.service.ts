import { newsRepository } from '../repositories/news.repository';
import logger from '../utils/logger';

export class NewsService {
  async getNews(limit = 20, symbols?: string) {
    const news = await newsRepository.findMany(limit, symbols);

    if (news.length === 0) {
      return {
        articles: [],
        message: 'No news articles available at the moment. Please try again later.',
      };
    }

    return { articles: news };
  }

  async refreshNews() {
    try {
      // Clean up articles older than 7 days
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      await newsRepository.deleteOlderThan(weekAgo);
      logger.info('Old news articles cleaned up');

      return { message: 'News cache refreshed' };
    } catch (error) {
      logger.error('Failed to refresh news', { error: (error as Error).message });
      throw error;
    }
  }
}

export const newsService = new NewsService();
