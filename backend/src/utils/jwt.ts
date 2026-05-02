import crypto from "crypto";
import jwt from "jsonwebtoken";
import { env } from "../config/env";

type AccessPayload = {
  sub: string;
  email: string;
  roles: string[];
};

export const signAccessToken = (payload: AccessPayload) =>
  jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: "15m" });

export const signRefreshToken = (payload: { sub: string }) =>
  jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: "7d" });

export const verifyAccessToken = (token: string) =>
  jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessPayload;

export const verifyRefreshToken = (token: string) =>
  jwt.verify(token, env.JWT_REFRESH_SECRET) as { sub: string; iat: number; exp: number };

export const hashToken = (token: string) =>
  crypto.createHash("sha256").update(token).digest("hex");