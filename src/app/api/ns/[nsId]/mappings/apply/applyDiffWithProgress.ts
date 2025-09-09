import { addGuildMemberRole } from "@/lib/discord/requests/addGuildMemberRole";
import { deleteGuildMemberRole } from "@/lib/discord/requests/deleteGuildMemberRole";
import type {
  DiscordGuildId,
  DiscordGuildRoleId,
} from "@/lib/discord/types/guild";
import type { DiscordUserId } from "@/lib/discord/types/user";
import { generateInstallationAccessToken } from "@/lib/github/generateInstallationAccessToken";
import { addOrUpdateTeammembershipForUser } from "@/lib/github/requests/addOrUpdateTeamMembershipForUser";
import { removeTeamMembershipForUser } from "@/lib/github/requests/removeTeamMembershipForUser";
import type {
  GitHubAccountUsername,
  GitHubOrganizationId,
} from "@/lib/github/types/Account";
import type { GitHubTeamSlug } from "@/lib/github/types/Team";
import { ZGitHubGroupId, ZGitHubRoleId } from "@/lib/github/types/encoded";
import { getExternalServiceAccountByServiceName } from "@/lib/prisma/getExternalServiceAccountByServiceName";
import { addRoleToGroupMember } from "@/lib/vrchat/requests/addRoleToGroupMember";
import { removeRoleFromGroupMember } from "@/lib/vrchat/requests/removeRoleFromGroupMember";
import {
  ZVRCGroupId,
  ZVRCGroupRoleId,
  ZVRCUserId,
} from "@/lib/vrchat/types/brand";
import { ZDiscordCredentials } from "@/types/credentials";
import type { TDiffItem, TMemberWithDiff } from "@/types/diff";
import type { TNamespaceId } from "@/types/prisma";

export type ApplyDiffResultStatus = "success" | "error" | "skipped";

export type ApplyDiffResultItem = TDiffItem & {
  status: ApplyDiffResultStatus;
  reason?: string;
};

export type ApplyDiffResult = TMemberWithDiff & {
  diff: ApplyDiffResultItem[];
};

export type ApplyProgressUpdate =
  | {
      type: "progress";
      stage: "applying_changes";
      services: {
        [key: string]: {
          status: "pending" | "in_progress" | "completed" | "error";
          current: number;
          total: number;
          success: number;
          errors: number;
          message: string;
        };
      };
      currentMember?: string;
    }
  | {
      type: "complete";
      result: ApplyDiffResult[];
    }
  | {
      type: "error";
      error: string;
    };

export type ApplyProgressCallback = (progress: ApplyProgressUpdate) => void;

export const applyDiffWithProgress = async (
  nsId: TNamespaceId,
  members: TMemberWithDiff[],
  onProgress?: ApplyProgressCallback,
): Promise<void> => {
  try {
    // サービス別の差分をグループ化
    const serviceStats: {
      [service: string]: {
        total: number;
        current: number;
        success: number;
        errors: number;
      };
    } = {};

    for (const { diff } of members) {
      for (const diffItem of diff) {
        if (!diffItem.ignore) {
          const serviceName = diffItem.serviceGroup.service.toLowerCase();
          if (!serviceStats[serviceName]) {
            serviceStats[serviceName] = {
              total: 0,
              current: 0,
              success: 0,
              errors: 0,
            };
          }
          serviceStats[serviceName].total++;
        }
      }
    }

    // 初期進捗報告
    const initialServices: {
      [service: string]: {
        status: "pending" | "in_progress" | "completed" | "error";
        current: number;
        total: number;
        success: number;
        errors: number;
        message: string;
      };
    } = Object.fromEntries(
      Object.entries(serviceStats).map(([service, stats]) => [
        service,
        {
          status: "pending",
          current: 0,
          total: stats.total,
          success: 0,
          errors: 0,
          message: `${service} の準備中...`,
        },
      ]),
    );

    onProgress?.({
      type: "progress",
      stage: "applying_changes",
      services: initialServices,
    });

    // 結果を格納する配列
    const results: ApplyDiffResult[] = [];

    // メンバーごとに並行処理
    for (const { member, diff } of members) {
      const memberResult: ApplyDiffResult = {
        member,
        diff: [],
      };

      // 差分アイテムごとに処理
      for (const diffItem of diff) {
        const serviceName = diffItem.serviceGroup.service.toLowerCase();

        // 進捗更新
        onProgress?.({
          type: "progress",
          stage: "applying_changes",
          services: {
            ...initialServices,
            [serviceName]: {
              ...initialServices[serviceName],
              status: "in_progress",
              message: `${member.externalAccounts.find((acc) => acc.service === diffItem.serviceGroup.service)?.name || member.id} を処理中...`,
            },
          },
          currentMember:
            member.externalAccounts.find(
              (acc) => acc.service === diffItem.serviceGroup.service,
            )?.name || member.id,
        });

        if (diffItem.ignore) {
          memberResult.diff.push({
            ...diffItem,
            status: "skipped",
            reason: "Ignored",
          });
          continue;
        }

        let resultItem: ApplyDiffResultItem;

        try {
          switch (diffItem.serviceGroup.service) {
            case "VRCHAT":
              resultItem = await applyVRChatDiff(nsId, diffItem);
              break;
            case "DISCORD":
              resultItem = await applyDiscordDiff(nsId, diffItem);
              break;
            case "GITHUB":
              resultItem = await applyGitHubDiff(nsId, diffItem);
              break;
            default:
              throw new Error("Unsupported service");
          }
        } catch (error) {
          resultItem = {
            ...diffItem,
            status: "error",
            reason: error instanceof Error ? error.message : "Unknown error",
          };
        }

        memberResult.diff.push(resultItem);

        // 結果に基づいて統計更新
        serviceStats[serviceName].current++;
        if (resultItem.status === "success") {
          serviceStats[serviceName].success++;
        } else if (resultItem.status === "error") {
          serviceStats[serviceName].errors++;
        }

        // 進捗更新
        const updatedServices = { ...initialServices };
        const newStatus: "pending" | "in_progress" | "completed" | "error" =
          serviceStats[serviceName].current >= serviceStats[serviceName].total
            ? "completed"
            : "in_progress";

        updatedServices[serviceName] = {
          status: newStatus,
          current: serviceStats[serviceName].current,
          total: serviceStats[serviceName].total,
          success: serviceStats[serviceName].success,
          errors: serviceStats[serviceName].errors,
          message: `${serviceName} 処理中... (${serviceStats[serviceName].current}/${serviceStats[serviceName].total})`,
        };

        onProgress?.({
          type: "progress",
          stage: "applying_changes",
          services: updatedServices,
        });
      }

      results.push(memberResult);
    }

    // 完了報告
    onProgress?.({
      type: "complete",
      result: results,
    });
  } catch (error) {
    onProgress?.({
      type: "error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

const applyVRChatDiff = async (
  nsId: TNamespaceId,
  diff: TDiffItem,
): Promise<ApplyDiffResultItem> => {
  const serviceAccount = await getExternalServiceAccountByServiceName(
    nsId,
    diff.serviceGroup.service,
  );
  if (!serviceAccount) {
    return {
      ...diff,
      status: "error",
      reason: "Service account not found",
    };
  }
  try {
    const groupId = ZVRCGroupId.parse(diff.serviceGroup.groupId);
    const userId = ZVRCUserId.parse(diff.groupMember.serviceId);
    const roleId = ZVRCGroupRoleId.parse(diff.roleId);
    if (diff.type === "add") {
      await addRoleToGroupMember(serviceAccount, groupId, userId, roleId);
    } else if (diff.type === "remove") {
      await removeRoleFromGroupMember(serviceAccount, groupId, userId, roleId);
    }
    return {
      ...diff,
      status: "success",
    };
  } catch (e) {
    if (e instanceof Error) {
      return {
        ...diff,
        status: "error",
        reason: e.message,
      };
    }
    return {
      ...diff,
      status: "error",
      reason: "Unknown error",
    };
  }
};

const applyDiscordDiff = async (
  nsId: TNamespaceId,
  diff: TDiffItem,
): Promise<ApplyDiffResultItem> => {
  const serviceAccount = await getExternalServiceAccountByServiceName(
    nsId,
    diff.serviceGroup.service,
  );
  if (!serviceAccount) {
    return {
      ...diff,
      status: "error",
      reason: "Service account not found",
    };
  }
  const credentials = ZDiscordCredentials.safeParse(
    JSON.parse(serviceAccount.credential),
  );
  if (!credentials.success) {
    return {
      ...diff,
      status: "error",
      reason: "Invalid credential",
    };
  }
  const { token } = credentials.data;
  try {
    const guildId = diff.serviceGroup.groupId as DiscordGuildId;
    const userId = diff.groupMember.serviceId as DiscordUserId;
    const roleId = diff.roleId as DiscordGuildRoleId;
    if (diff.type === "add") {
      await addGuildMemberRole(token, guildId, userId, roleId);
    } else if (diff.type === "remove") {
      await deleteGuildMemberRole(token, guildId, userId, roleId);
    }
    return {
      ...diff,
      status: "success",
    };
  } catch (e) {
    if (e instanceof Error) {
      return {
        ...diff,
        status: "error",
        reason: e.message,
      };
    }
    return {
      ...diff,
      status: "error",
      reason: "Unknown error",
    };
  }
};

const applyGitHubDiff = async (
  nsId: TNamespaceId,
  diff: TDiffItem,
): Promise<ApplyDiffResultItem> => {
  const serviceAccount = await getExternalServiceAccountByServiceName(
    nsId,
    diff.serviceGroup.service,
  );
  if (!serviceAccount) {
    return {
      ...diff,
      status: "error",
      reason: "Service account not found",
    };
  }
  try {
    const { accountId, installationId } = ZGitHubGroupId.parse(
      JSON.parse(diff.serviceGroup.groupId),
    );
    const token = await generateInstallationAccessToken(
      serviceAccount,
      installationId,
    );
    const organizationId = accountId as GitHubOrganizationId;
    const { teamSlug } = ZGitHubRoleId.parse(JSON.parse(diff.roleId));
    const username = diff.groupMember.serviceUsername as GitHubAccountUsername;
    if (diff.type === "add") {
      await addOrUpdateTeammembershipForUser(
        token,
        organizationId,
        teamSlug as GitHubTeamSlug,
        username,
      );
    } else if (diff.type === "remove") {
      await removeTeamMembershipForUser(
        token,
        organizationId,
        teamSlug as GitHubTeamSlug,
        username,
      );
    }
    return {
      ...diff,
      status: "success",
    };
  } catch (e) {
    if (e instanceof Error) {
      return {
        ...diff,
        status: "error",
        reason: e.message,
      };
    }
    return {
      ...diff,
      status: "error",
      reason: "Unknown error",
    };
  }
};
