import prisma from '../config/database';
import { Prisma } from '@prisma/client';

export class NewsRepository {
  async findMany(limit = 20, symbols?: string) {
    const where: Prisma.NewsArticleWhereInput = {};
    if (symbols) {
      where.symbols = { contains: symbols };
    }

    return prisma.newsArticle.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      take: limit,
    });
  }

  async create(data: Prisma.NewsArticleCreateInput) {
    return prisma.newsArticle.create({ data });
  }

  async createMany(articles: Prisma.NewsArticleCreateInput[]) {
    const results = [];
    for (const article of articles) {
      const result = await prisma.newsArticle.create({ data: article });
      results.push(result);
    }
    return results;
  }

  async deleteOlderThan(date: Date) {
    return prisma.newsArticle.deleteMany({
      where: { cachedAt: { lt: date } },
    });
  }
}

export const newsRepository = new NewsRepository();
