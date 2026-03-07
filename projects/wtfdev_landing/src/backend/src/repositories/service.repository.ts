import { query } from "../config/database.js";

export interface ServiceRow {
  id: string;
  name: string;
  slug: string;
  short_description: string;
  full_description: string;
  icon_url: string | null;
  features: string[];
  display_order: number;
  active: boolean;
}

export const serviceRepository = {
  async findAll(includeInactive: boolean) {
    const condition = includeInactive ? "" : "WHERE active = true";
    const result = await query<ServiceRow>(
      `SELECT * FROM service ${condition} ORDER BY display_order ASC`
    );
    return result.rows;
  },

  async findBySlug(slug: string): Promise<ServiceRow | null> {
    const result = await query<ServiceRow>(
      "SELECT * FROM service WHERE slug = $1 AND active = true",
      [slug]
    );
    return result.rows[0] ?? null;
  },
};
