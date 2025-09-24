import type { TNamespaceId } from "@/types/prisma";
import jwt from "jsonwebtoken";

export interface TPlanPayload {
  nsId: TNamespaceId;
  userId: string;
  createdAt: number;
  data: unknown; // プラン固有のデータ
}

const JWT_EXPIRY = "30m"; // 30分

function getJwtSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET is not configured");
  }
  return secret;
}

export function signPlan(payload: TPlanPayload): string {
  const secret = getJwtSecret();
  return jwt.sign(payload, secret, {
    expiresIn: JWT_EXPIRY,
    issuer: "role-management-automation",
    subject: "plan",
  });
}

export function verifyPlan(token: string): TPlanPayload {
  const secret = getJwtSecret();
  try {
    const decoded = jwt.verify(token, secret, {
      issuer: "role-management-automation",
      subject: "plan",
    });

    if (typeof decoded === "string") {
      throw new Error("Invalid token format");
    }

    return decoded as TPlanPayload;
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error(`Invalid token: ${error.message}`);
    }
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error("Token has expired");
    }
    if (error instanceof jwt.NotBeforeError) {
      throw new Error("Token is not active yet");
    }
    throw error;
  }
}
