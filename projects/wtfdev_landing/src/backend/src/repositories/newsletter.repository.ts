import { query } from "../config/database.js";

interface SubscriberRow {
  id: string;
  email: string;
  subscribed_at: Date;
  unsubscribed_at: Date | null;
  source: string;
}

export const newsletterRepository = {
  async findByEmail(email: string): Promise<SubscriberRow | null> {
    const result = await query<SubscriberRow>(
      "SELECT * FROM newsletter_subscriber WHERE email = $1",
      [email]
    );
    return result.rows[0] ?? null;
  },

  async create(email: string, source: string): Promise<SubscriberRow> {
    const result = await query<SubscriberRow>(
      `INSERT INTO newsletter_subscriber (email, source)
       VALUES ($1, $2)
       RETURNING *`,
      [email, source]
    );
    return result.rows[0]!;
  },

  async resubscribe(email: string): Promise<SubscriberRow> {
    const result = await query<SubscriberRow>(
      `UPDATE newsletter_subscriber SET unsubscribed_at = NULL, subscribed_at = NOW()
       WHERE email = $1 RETURNING *`,
      [email]
    );
    return result.rows[0]!;
  },

  async unsubscribe(email: string): Promise<SubscriberRow> {
    const result = await query<SubscriberRow>(
      `UPDATE newsletter_subscriber SET unsubscribed_at = NOW()
       WHERE email = $1 AND unsubscribed_at IS NULL RETURNING *`,
      [email]
    );
    return result.rows[0]!;
  },
};
