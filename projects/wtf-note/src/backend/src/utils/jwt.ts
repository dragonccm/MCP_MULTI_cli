import jwt, { JwtPayload } from "jsonwebtoken";
import { env } from "../config/env";

export interface TokenPayload extends JwtPayload {
  userId: string;
  email: string;
}

export function generateAccessToken(payload: { userId: string; email: string }): string {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: 900 }); // 15 minutes
}

export function generateRefreshToken(payload: { userId: string; email: string }): string {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: 604800 }); // 7 days
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
}

export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as TokenPayload;
}
