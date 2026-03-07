import type { Request, Response, NextFunction } from "express";
import { config } from "../config/index.js";
import { UnauthorizedError } from "../utils/errors.js";

export function adminAuth(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const apiKey = req.headers["x-api-key"] as string | undefined;

  if (apiKey === config.adminApiKey) {
    next();
    return;
  }

  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    if (token === config.adminApiKey) {
      next();
      return;
    }
  }

  throw new UnauthorizedError();
}
