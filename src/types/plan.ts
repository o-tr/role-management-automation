import { z } from "zod";
import { type TMemberWithDiff, ZMemberWithDiff } from "./diff";
import type { TNamespaceId } from "./prisma";

// Compare時に取得した元データを格納する型
export interface TTargetGroupData {
  serviceAccountId: string;
  serviceGroupId: string;
  service: string;
  members: Array<{
    userId: string;
    userName?: string;
    roles: string[];
  }>;
}

// グループ情報
export interface TGroupData {
  account: {
    id: string;
  };
  id: string;
  service: string;
  name?: string;
  groupId: string;
}

// Compare結果全体を格納するプラン
export interface TComparePlan {
  nsId: TNamespaceId;
  userId: string;
  createdAt: number;
  diff: TMemberWithDiff[];
  // 元データを保持してApply時の再取得を回避
  groupMembers: TTargetGroupData[];
  groups: TGroupData[];
}

// JWT化されたプラン
export interface TSignedComparePlan {
  token: string;
  expiresAt: number;
}

// Zod schemas for validation
export const ZTTargetGroupData = z.object({
  serviceAccountId: z.string(),
  serviceGroupId: z.string(),
  service: z.string(),
  members: z.array(
    z.object({
      userId: z.string(),
      userName: z.string().optional(),
      roles: z.array(z.string()),
    }),
  ),
});

export const ZTGroupData = z.object({
  account: z.object({
    id: z.string(),
  }),
  id: z.string(),
  service: z.string(),
  name: z.string().optional(),
  groupId: z.string(),
});

export const ZTComparePlan = z.object({
  nsId: z.string().uuid(), // Use plain UUID validation, will be cast to TNamespaceId
  userId: z.string(),
  createdAt: z.number(),
  diff: z.array(ZMemberWithDiff),
  groupMembers: z.array(ZTTargetGroupData),
  groups: z.array(ZTGroupData),
});
