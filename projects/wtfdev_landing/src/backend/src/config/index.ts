import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: parseInt(process.env["PORT"] || "3001", 10),
  nodeEnv: process.env["NODE_ENV"] || "development",
  adminApiKey: process.env["ADMIN_API_KEY"] || "",
  corsOrigin: process.env["CORS_ORIGIN"] || "http://localhost:3000",
} as const;
