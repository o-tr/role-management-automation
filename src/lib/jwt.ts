import type { TMemberWithDiff } from "@/types/diff";
import type { TNamespaceId } from "@/types/prisma";
import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key-change-this-in-production",
);

export interface DiffTokenPayload {
  nsId: TNamespaceId;
  diff: TMemberWithDiff[];
  timestamp: number;
  exp: number; // 有効期限（1時間後）
  [key: string]: unknown; // JWTペイロードの型要件を満たすため
}

/**
 * 差分データをJWTトークンとして生成する
 * @param nsId ネームスペースID
 * @param diff 差分データ
 * @returns JWTトークン
 */
export async function createDiffToken(
  nsId: TNamespaceId,
  diff: TMemberWithDiff[],
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + 3600; // 1時間後

  const payload: DiffTokenPayload = {
    nsId,
    diff,
    timestamp: now,
    exp,
  };

  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt(now)
    .setExpirationTime(exp)
    .sign(JWT_SECRET);
}

/**
 * JWTトークンを検証して差分データを取得する
 * @param token JWTトークン
 * @param expectedNsId 期待されるネームスペースID
 * @returns 検証された差分データ
 */
export async function verifyDiffToken(
  token: string,
  expectedNsId: TNamespaceId,
): Promise<TMemberWithDiff[]> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);

    // ペイロードの型チェック
    if (!payload.nsId || !payload.diff || !Array.isArray(payload.diff)) {
      throw new Error("Invalid token payload");
    }

    // ネームスペースIDの検証
    if (payload.nsId !== expectedNsId) {
      throw new Error("Namespace ID mismatch");
    }

    // 有効期限の検証（jwtVerifyで自動的に行われるが、明示的にチェック）
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      throw new Error("Token expired");
    }

    return payload.diff as TMemberWithDiff[];
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Token verification failed: ${error.message}`);
    }
    throw new Error("Token verification failed: Unknown error");
  }
}

/**
 * JWTトークンが有効かどうかをチェックする（データを取得せずに検証のみ）
 * @param token JWTトークン
 * @param expectedNsId 期待されるネームスペースID
 * @returns 有効かどうか
 */
export async function isTokenValid(
  token: string,
  expectedNsId: TNamespaceId,
): Promise<boolean> {
  try {
    await verifyDiffToken(token, expectedNsId);
    return true;
  } catch {
    return false;
  }
}
