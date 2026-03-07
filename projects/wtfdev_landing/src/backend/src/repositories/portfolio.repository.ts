import { query } from "../config/database.js";
import type { PortfolioQueryInput } from "../utils/validators.js";

export interface PortfolioRow {
  id: string;
  title: string;
  description: string;
  category: string;
  thumbnail_url: string | null;
  gallery_urls: string[];
  client_name: string | null;
  technologies: string[];
  outcome: string | null;
  published: boolean;
  created_at: Date;
  updated_at: Date;
}

export const portfolioRepository = {
  async findAllPublished(filters: PortfolioQueryInput) {
    const { page, limit, category } = filters;
    const offset = (page - 1) * limit;

    let dataQuery = `SELECT id, title, description, category, thumbnail_url, technologies, client_name, outcome
       FROM portfolio_project WHERE published = true`;
    let countQuery = `SELECT COUNT(*)::text as count FROM portfolio_project WHERE published = true`;
    const dataParams: unknown[] = [];
    const countParams: unknown[] = [];

    if (category) {
      dataQuery += ` AND category = $1`;
      countQuery += ` AND category = $1`;
      dataParams.push(category);
      countParams.push(category);
    }

    dataQuery += ` ORDER BY created_at DESC LIMIT $${dataParams.length + 1} OFFSET $${dataParams.length + 2}`;
    dataParams.push(limit, offset);

    const [dataResult, countResult] = await Promise.all([
      query<PortfolioRow>(dataQuery, dataParams),
      query<{ count: string }>(countQuery, countParams),
    ]);

    return {
      data: dataResult.rows,
      total: parseInt(countResult.rows[0]?.count ?? "0", 10),
    };
  },

  async findById(id: string): Promise<PortfolioRow | null> {
    const result = await query<PortfolioRow>(
      "SELECT * FROM portfolio_project WHERE id = $1 AND published = true",
      [id]
    );
    return result.rows[0] ?? null;
  },

  async getCategories() {
    const result = await query<{ name: string; count: string }>(
      `SELECT category as name, COUNT(*)::text as count FROM portfolio_project
       WHERE published = true GROUP BY category ORDER BY count DESC`
    );
    return result.rows.map((r) => ({ name: r.name, count: parseInt(r.count, 10) }));
  },
};
