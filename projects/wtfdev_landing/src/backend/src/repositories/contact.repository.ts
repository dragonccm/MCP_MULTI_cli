import { query } from "../config/database.js";
import type { CreateContactInput, ContactQueryInput } from "../utils/validators.js";

interface ContactRow {
  id: string;
  name: string;
  email: string;
  message: string;
  company: string | null;
  phone: string | null;
  service_interest: string | null;
  status: string;
  created_at: Date;
}

export const contactRepository = {
  async create(data: CreateContactInput): Promise<ContactRow> {
    const result = await query<ContactRow>(
      `INSERT INTO contact_inquiry (name, email, message, company, phone, service_interest)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        data.name,
        data.email,
        data.message,
        data.company ?? null,
        data.phone ?? null,
        data.service_interest ?? null,
      ]
    );
    return result.rows[0]!;
  },

  async findAll(filters: ContactQueryInput) {
    const { page, limit, status, sort, order } = filters;
    const offset = (page - 1) * limit;

    const sortFieldMap: Record<string, string> = {
      created_at: "created_at",
      name: "name",
      email: "email",
      status: "status",
    };
    const sortField = sortFieldMap[sort] ?? "created_at";
    const sortOrder = order === "asc" ? "ASC" : "DESC";

    let dataQuery = `SELECT * FROM contact_inquiry`;
    let countQuery = `SELECT COUNT(*)::text as count FROM contact_inquiry`;
    const dataParams: unknown[] = [];
    const countParams: unknown[] = [];

    if (status) {
      dataQuery += ` WHERE status = $1`;
      countQuery += ` WHERE status = $1`;
      dataParams.push(status);
      countParams.push(status);
    }

    dataQuery += ` ORDER BY ${sortField} ${sortOrder} LIMIT $${dataParams.length + 1} OFFSET $${dataParams.length + 2}`;
    dataParams.push(limit, offset);

    const [dataResult, countResult] = await Promise.all([
      query<ContactRow>(dataQuery, dataParams),
      query<{ count: string }>(countQuery, countParams),
    ]);

    return {
      data: dataResult.rows,
      total: parseInt(countResult.rows[0]?.count ?? "0", 10),
    };
  },
};
