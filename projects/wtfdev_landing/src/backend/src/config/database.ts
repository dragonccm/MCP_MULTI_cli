import pg from "pg";
import { config } from "./index.js";

const pool = new pg.Pool({
  connectionString: process.env["DATABASE_URL"],
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

pool.on("error", (err: Error) => {
  console.error("Unexpected pool error:", err);
});

export async function query<T extends pg.QueryResultRow>(
  text: string,
  params?: unknown[]
): Promise<pg.QueryResult<T>> {
  const start = Date.now();
  const result = await pool.query<T>(text, params);
  const duration = Date.now() - start;
  if (config.nodeEnv === "development") {
    console.info(`Query (${duration}ms): ${text.slice(0, 80)}`);
  }
  return result;
}

export async function testConnection(): Promise<void> {
  await pool.query("SELECT 1");
}

export async function disconnect(): Promise<void> {
  await pool.end();
}

export { pool };

