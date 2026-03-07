import { Request } from "express";
import { TokenPayload } from "../utils/jwt";

export interface AuthRequest extends Request {
  user?: TokenPayload;
}

export type TransactionType = "income" | "expense";
export type DebtType = "owed" | "owing";
export type DebtStatus = "active" | "paid" | "overdue";
export type AssetType = "stock" | "crypto" | "real_estate";
export type AiInsightType = "spending_insight" | "budget_recommendation" | "net_worth_projection";
export type MarketType = "stock" | "crypto";
