import {
  DIFF_CALCULATION_STAGES,
  DIFF_FETCH_STAGES,
  PROGRESS_MESSAGES,
} from "@/lib/constants/progress";
import { signPlan } from "@/lib/jwt/plan";
import { calculateDiff, extractTargetGroups } from "@/lib/mapping/memberDiff";
import { getInvitedUsers } from "@/lib/mapping/memberDiff";
import { convertTSerializedMappingToTMapping } from "@/lib/prisma/convert/convertTSerializedMappingToTMapping";
import { getExternalServiceAccounts } from "@/lib/prisma/getExternalServiceAccounts";
import { getExternalServiceGroupRoleMappingsByNamespaceId } from "@/lib/prisma/getExternalServiceGroupRoleMappingByNamespaceId";
import { getExternalServiceGroups } from "@/lib/prisma/getExternalServiceGroups";
import { getMembersWithRelation } from "@/lib/prisma/getMembersWithRelation";
import type { TMemberWithDiff } from "@/types/diff";
import type { TComparePlan, TGroupData, TTargetGroupData } from "@/types/plan";
import type { TNamespaceId } from "@/types/prisma";
import { getMembersWithProgress } from "../../services/accounts/[accountId]/groups/[groupId]/members/getMembersWithProgress";
import type {
  CommonProgressCallback,
  CommonProgressUpdate,
  ServiceProgressState,
} from "./types";

/**
 * メンバー情報を取得して差分を計算する共通関数
 * Compare RouteとApply Routeで共通利用される
 */
export const getMemberWithDiffWithProgress = async (
  nsId: TNamespaceId,
  userId: string,
  onProgress: CommonProgressCallback,
  abortSignal?: AbortSignal,
): Promise<TMemberWithDiff[]> => {
  try {
    // 初期状態の報告
    onProgress({
      type: "progress",
      stage: "fetching_members",
      services: {
        database: {
          status: "in_progress",
          current: 0,
          total: DIFF_FETCH_STAGES.TOTAL,
          message: PROGRESS_MESSAGES.DATABASE_INIT,
        },
      },
    });

    // メンバー取得
    onProgress({
      type: "progress",
      stage: "fetching_members",
      services: {
        database: {
          status: "in_progress",
          current: DIFF_FETCH_STAGES.MEMBERS,
          total: DIFF_FETCH_STAGES.TOTAL,
          message: PROGRESS_MESSAGES.MEMBERS_FETCH,
        },
      },
    });
    const members = await getMembersWithRelation(nsId);

    // マッピング取得
    onProgress({
      type: "progress",
      stage: "fetching_members",
      services: {
        database: {
          status: "in_progress",
          current: DIFF_FETCH_STAGES.MAPPINGS,
          total: DIFF_FETCH_STAGES.TOTAL,
          message: PROGRESS_MESSAGES.MAPPINGS_FETCH,
        },
      },
    });
    const mappings = (
      await getExternalServiceGroupRoleMappingsByNamespaceId(nsId)
    ).map(convertTSerializedMappingToTMapping);

    // グループ取得
    onProgress({
      type: "progress",
      stage: "fetching_members",
      services: {
        database: {
          status: "in_progress",
          current: DIFF_FETCH_STAGES.GROUPS,
          total: DIFF_FETCH_STAGES.TOTAL,
          message: PROGRESS_MESSAGES.GROUPS_FETCH,
        },
      },
    });
    const groups = await getExternalServiceGroups(nsId);
    const targetGroups = extractTargetGroups(groups, mappings);

    // サービスアカウント取得
    const serviceAccounts = await getExternalServiceAccounts(nsId);

    // 初期データ取得完了
    onProgress({
      type: "progress",
      stage: "fetching_members",
      services: {
        database: {
          status: "completed",
          current: DIFF_FETCH_STAGES.COMPLETE,
          total: DIFF_FETCH_STAGES.TOTAL,
          message: PROGRESS_MESSAGES.DATABASE_COMPLETE,
        },
      },
    });

    // 各グループの初期進捗状態を設定
    const progressState: {
      [key: string]: ServiceProgressState;
    } = {
      database: {
        status: "completed",
        current: DIFF_FETCH_STAGES.COMPLETE,
        total: DIFF_FETCH_STAGES.TOTAL,
        message: PROGRESS_MESSAGES.DATABASE_COMPLETE,
      },
    };

    // 各targetGroupに対応するgroupの情報を取得してprogress stateに追加
    for (const targetGroup of targetGroups) {
      const group = groups.find(
        (g) =>
          g.account.id === targetGroup.serviceAccountId &&
          g.id === targetGroup.serviceGroupId,
      );
      if (group) {
        const serviceName = group.service.toLowerCase();
        const groupKey = `${serviceName}-${group.name || group.groupId}`;
        progressState[groupKey] = {
          status: "pending",
          current: 0,
          total: "unknown",
          message: `${serviceName} (${group.name || group.groupId}) の準備中...`,
        };
      }
    }

    onProgress({
      type: "progress",
      stage: "fetching_members",
      services: progressState,
    });

    // 各グループのメンバーを並行取得
    const groupMembers = await Promise.all(
      targetGroups.map(async (targetGroup) => {
        if (abortSignal?.aborted) {
          throw new Error("Operation aborted");
        }

        const group = groups.find(
          (g) =>
            g.account.id === targetGroup.serviceAccountId &&
            g.id === targetGroup.serviceGroupId,
        );
        if (!group) {
          throw new Error("Group not found");
        }

        const serviceName = group.service.toLowerCase();
        const groupKey = `${serviceName}-${group.name || group.groupId}`;
        const groupDisplayName = `${serviceName} (${group.name || group.groupId})`;

        // 取得開始の報告
        progressState[groupKey] = {
          status: "in_progress",
          current: 0,
          total: "unknown",
          message: `${groupDisplayName} のメンバー取得中...`,
        };
        onProgress({
          type: "progress",
          stage: "fetching_members",
          services: { ...progressState },
        });

        try {
          const groupMembersResult = await getMembersWithProgress(
            group,
            (current, total) => {
              if (abortSignal?.aborted) {
                return;
              }
              progressState[groupKey] = {
                status: "in_progress",
                current,
                total: total || "unknown",
                message: `${groupDisplayName} のメンバー取得中... (${current}${total ? `/${total}` : ""})`,
              };
              if (!abortSignal?.aborted) {
                onProgress({
                  type: "progress",
                  stage: "fetching_members",
                  services: { ...progressState },
                });
              }
            },
            abortSignal,
          );

          // 完了の報告
          progressState[groupKey] = {
            status: "completed",
            current: groupMembersResult.members.length,
            total: groupMembersResult.members.length,
            message: `${groupDisplayName} のメンバー取得完了 (${groupMembersResult.members.length}件)`,
          };
          // Propagate isApproximate if provided by the service-specific fetcher
          if (groupMembersResult.isApproximate) {
            progressState[groupKey].isApproximate = true;
          }
          onProgress({
            type: "progress",
            stage: "fetching_members",
            services: { ...progressState },
          });

          return {
            serviceAccountId: targetGroup.serviceAccountId,
            serviceGroupId: targetGroup.serviceGroupId,
            members: groupMembersResult.members,
            service: group.service,
          };
        } catch (error) {
          progressState[groupKey] = {
            status: "error",
            current: 0,
            total: "unknown",
            message: `${groupDisplayName} でエラーが発生`,
            error: error instanceof Error ? error.message : "Unknown error",
          };
          onProgress({
            type: "progress",
            stage: "fetching_members",
            services: { ...progressState },
          });
          throw error;
        }
      }),
    );

    // 差分計算の報告
    const calculatingState: { [key: string]: ServiceProgressState } = {
      ...progressState,
      calculation: {
        status: "in_progress",
        current: 0,
        total: DIFF_CALCULATION_STAGES.TOTAL,
        message: PROGRESS_MESSAGES.DIFF_CALCULATING,
      },
    };

    onProgress({
      type: "progress",
      stage: "calculating_diff",
      services: calculatingState,
    });

    if (abortSignal?.aborted) {
      throw new Error("Operation aborted");
    }

    // VRChatの招待送信済みユーザーを事前に取得
    const invitedUsersMap = new Map<string, Set<string>>();
    for (const group of groups) {
      if (group.service === "VRCHAT") {
        const serviceAccount = serviceAccounts.find(
          (account) => account.id === group.account.id,
        );
        if (serviceAccount) {
          try {
            const invitedUsers = await getInvitedUsers(
              serviceAccount,
              group.groupId,
            );
            invitedUsersMap.set(
              `${group.account.id}-${group.groupId}`,
              invitedUsers,
            );
          } catch (error) {
            console.warn(
              `Failed to get invited users for group ${group.groupId}:`,
              error,
            );
          }
        }
      }
    }

    const result = await calculateDiff(
      members,
      mappings,
      groupMembers,
      groups,
      invitedUsersMap,
    );

    // 計算完了
    calculatingState.calculation = {
      status: "completed",
      current: DIFF_CALCULATION_STAGES.COMPLETE,
      total: DIFF_CALCULATION_STAGES.TOTAL,
      message: `差分計算完了（${result.length}件の差分を検出）`,
    };

    onProgress({
      type: "progress",
      stage: "calculating_diff",
      services: calculatingState,
    });

    // JWTトークンを生成
    const planData: TComparePlan = {
      nsId,
      userId,
      createdAt: Date.now(),
      diff: result,
      groupMembers: groupMembers.map(
        (gm): TTargetGroupData => ({
          serviceAccountId: gm.serviceAccountId,
          serviceGroupId: gm.serviceGroupId,
          service: gm.service,
          members: gm.members.map((member) => ({
            userId: member.serviceId,
            userName: member.serviceUsername,
            roles: member.roleIds,
          })),
        }),
      ),
      groups: groups.map(
        (g): TGroupData => ({
          account: { id: g.account.id },
          id: g.id,
          service: g.service,
          name: g.name,
          groupId: g.groupId,
        }),
      ),
    };

    const token = signPlan({
      nsId,
      userId,
      createdAt: planData.createdAt,
      data: planData,
    });

    // 完了の報告
    if (!abortSignal?.aborted) {
      onProgress({
        type: "complete",
        result,
        token,
      });
    }

    return result;
  } catch (error) {
    onProgress({
      type: "error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
    throw error;
  }
};
