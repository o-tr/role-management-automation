import { calculateDiff, extractTargetGroups } from "@/lib/mapping/memberDiff";
import { convertTSerializedMappingToTMapping } from "@/lib/prisma/convert/convertTSerializedMappingToTMapping";
import { getExternalServiceGroupRoleMappingsByNamespaceId } from "@/lib/prisma/getExternalServiceGroupRoleMappingByNamespaceId";
import { getExternalServiceGroups } from "@/lib/prisma/getExternalServiceGroups";
import { getMembersWithRelation } from "@/lib/prisma/getMembersWithRelation";
import { validatePermission } from "@/lib/validatePermission";
import type { TMemberWithDiff } from "@/types/diff";
import type { TNamespaceId } from "@/types/prisma";
import type { NextRequest } from "next/server";
import { getMembersWithProgress } from "../../services/accounts/[accountId]/groups/[groupId]/members/getMembersWithProgress";

export type ProgressCallback = (progress: ProgressUpdate) => void;

export type ProgressUpdate =
  | {
      type: "progress";
      stage: "fetching_members" | "calculating_diff" | "complete";
      services: {
        [key: string]: {
          status: "pending" | "in_progress" | "completed" | "error";
          current: number;
          total: number | "unknown";
          message: string;
          error?: string;
        };
      };
    }
  | {
      type: "complete";
      result: TMemberWithDiff[];
    }
  | {
      type: "error";
      error: string;
    };

export async function GET(
  req: NextRequest,
  { params }: { params: { nsId: TNamespaceId } },
) {
  try {
    await validatePermission(params.nsId, "admin");

    const stream = new ReadableStream({
      start(controller) {
        getMemberWithDiffWithProgress(params.nsId, (progress) => {
          const data = `data: ${JSON.stringify(progress)}\n\n`;
          controller.enqueue(new TextEncoder().encode(data));

          if (progress.type === "complete" || progress.type === "error") {
            controller.close();
          }
        }).catch((error) => {
          const errorData = `data: ${JSON.stringify({
            type: "error",
            error: error.message,
          } satisfies ProgressUpdate)}\n\n`;
          controller.enqueue(new TextEncoder().encode(errorData));
          controller.close();
        });
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}

const getMemberWithDiffWithProgress = async (
  nsId: TNamespaceId,
  onProgress: ProgressCallback,
): Promise<void> => {
  try {
    // 初期状態の報告
    onProgress({
      type: "progress",
      stage: "fetching_members",
      services: {},
    });

    // メンバー取得
    const members = await getMembersWithRelation(nsId);

    // マッピング取得
    const mappings = (
      await getExternalServiceGroupRoleMappingsByNamespaceId(nsId)
    ).map(convertTSerializedMappingToTMapping);

    // グループ取得
    const groups = await getExternalServiceGroups(nsId);
    const targetGroups = extractTargetGroups(groups, mappings);

    // サービス別グループメンバー取得の準備
    const serviceGroups: { [service: string]: typeof targetGroups } = {};
    for (const targetGroup of targetGroups) {
      const group = groups.find(
        (group) =>
          group.account.id === targetGroup.serviceAccountId &&
          group.id === targetGroup.serviceGroupId,
      );
      if (group) {
        const serviceName = group.service.toLowerCase();
        if (!serviceGroups[serviceName]) {
          serviceGroups[serviceName] = [];
        }
        serviceGroups[serviceName].push(targetGroup);
      }
    }

    // 各サービスの初期進捗状態を設定
    const progressState: {
      [key: string]: {
        status: "pending" | "in_progress" | "completed" | "error";
        current: number;
        total: number | "unknown";
        message: string;
        error?: string;
      };
    } = {};
    for (const [serviceName] of Object.entries(serviceGroups)) {
      progressState[serviceName] = {
        status: "pending",
        current: 0,
        total: "unknown",
        message: `${serviceName} の準備中...`,
      };
    }

    onProgress({
      type: "progress",
      stage: "fetching_members",
      services: progressState,
    });

    // 各サービスのグループメンバーを並行取得
    const groupMembers = await Promise.all(
      targetGroups.map(async (targetGroup) => {
        const group = groups.find(
          (group) =>
            group.account.id === targetGroup.serviceAccountId &&
            group.id === targetGroup.serviceGroupId,
        );
        if (!group) {
          throw new Error("Group not found");
        }

        const serviceName = group.service.toLowerCase();

        // 取得開始の報告
        progressState[serviceName] = {
          status: "in_progress",
          current: 0,
          total: "unknown",
          message: `${serviceName} のメンバー取得中...`,
        };
        onProgress({
          type: "progress",
          stage: "fetching_members",
          services: { ...progressState },
        });

        try {
          const groupMembers = await getMembersWithProgress(
            group,
            (current, total) => {
              progressState[serviceName] = {
                status: "in_progress",
                current,
                total: total || "unknown",
                message: `${serviceName} のメンバー取得中... (${current}${total ? `/${total}` : ""})`,
              };
              onProgress({
                type: "progress",
                stage: "fetching_members",
                services: { ...progressState },
              });
            },
          );

          // 完了の報告
          progressState[serviceName] = {
            status: "completed",
            current: groupMembers.length,
            total: groupMembers.length,
            message: `${serviceName} のメンバー取得完了 (${groupMembers.length}件)`,
          };
          onProgress({
            type: "progress",
            stage: "fetching_members",
            services: { ...progressState },
          });

          return {
            serviceAccountId: targetGroup.serviceAccountId,
            serviceGroupId: targetGroup.serviceGroupId,
            members: groupMembers,
            service: group.service,
          };
        } catch (error) {
          progressState[serviceName] = {
            status: "error",
            current: 0,
            total: "unknown",
            message: `${serviceName} でエラーが発生`,
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
    onProgress({
      type: "progress",
      stage: "calculating_diff",
      services: progressState,
    });

    const result = calculateDiff(members, mappings, groupMembers, groups);

    // 完了の報告
    onProgress({
      type: "complete",
      result,
    });
  } catch (error) {
    onProgress({
      type: "error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
