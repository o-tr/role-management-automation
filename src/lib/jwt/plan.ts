import jwt from "jsonwebtoken";
import { z } from "zod";
import type { TNamespaceId } from "@/types/prisma";

export interface TPlanPayload {
  nsId: TNamespaceId;
  userId: string;
  createdAt: number;
  data: unknown; // プラン固有のデータ
}

// Zod schema for JWT payload validation
const ZTPlanPayload = z
  .object({
    nsId: z.string().uuid(), // Use UUID validation, will be cast to TNamespaceId
    userId: z.string(),
    createdAt: z.number(),
    data: z.unknown(), // Accept any data type for the payload data
    // JWT standard fields that might be present
    iat: z.number().optional(),
    exp: z.number().optional(),
    iss: z.string().optional(),
    sub: z.string().optional(),
  })
  .passthrough(); // Allow additional JWT fields that we don't need

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

    // Validate decoded JWT payload with Zod
    const validationResult = ZTPlanPayload.safeParse(decoded);
    if (!validationResult.success) {
      throw new Error(
        `Invalid JWT payload structure: ${validationResult.error.message}`,
      );
    }

    // Extract only the fields we need for TPlanPayload and cast nsId to proper branded type
    return {
      nsId: validationResult.data.nsId as TNamespaceId,
      userId: validationResult.data.userId,
      createdAt: validationResult.data.createdAt,
      data: validationResult.data.data,
    };
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
