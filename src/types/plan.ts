import type { TMemberWithDiff } from "./diff";
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
