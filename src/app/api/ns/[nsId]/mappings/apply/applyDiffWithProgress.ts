import { makeDiffKeyFromItem } from "@/lib/diffKey";
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
import { inviteUserToGroup } from "@/lib/vrchat/requests/inviteUserToGroup";
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
      stage: "fetching_members" | "calculating_diff" | "applying_changes";
      services: {
        [key: string]: {
          status: "pending" | "in_progress" | "completed" | "error" | "skipped";
          current: number;
          total: number | "unknown";
          success?: number;
          errors?: number;
          message: string;
          error?: string;
          isApproximate?: boolean;
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
    // すべての差分を個別タスクとして扱う
    type Task = {
      key: string;
      member: (typeof members)[number]["member"];
      diffItem: TDiffItem;
    };

    const tasks: Task[] = [];
    for (let mi = 0; mi < members.length; mi++) {
      const { member, diff } = members[mi];
      for (let di = 0; di < diff.length; di++) {
        const diffItem = diff[di];
        // 一意キーを生成（インデックス＋重要フィールド）
        const key = makeDiffKeyFromItem(mi, di, diffItem);
        tasks.push({ key, member, diffItem });
      }
    }

    // 初期進捗（タスク単位）
    const servicesState: {
      [taskKey: string]: {
        status: "pending" | "in_progress" | "completed" | "error" | "skipped";
        current: number;
        total: number | "unknown";
        success?: number;
        errors?: number;
        message: string;
        error?: string;
      };
    } = Object.fromEntries(
      tasks.map((t) => {
        const accountName =
          t.member.externalAccounts?.find(
            (acc) => acc.service === t.diffItem.serviceGroup.service,
          )?.name || t.member.id;
        return [
          t.key,
          {
            status: "pending",
            current: 0,
            total: 1,
            success: 0,
            errors: 0,
            message: `${t.diffItem.serviceGroup.service} - ${accountName} の準備中...`,
          },
        ];
      }),
    );

    onProgress?.({
      type: "progress",
      stage: "applying_changes",
      services: servicesState,
    });

    // 結果をメンバー毎に収集するマップ
    const resultsMap: Map<string, ApplyDiffResult> = new Map();

    // タスク単位で順次処理
    for (const { key, member, diffItem } of tasks) {
      // メンバー結果を準備
      if (!resultsMap.has(member.id)) {
        resultsMap.set(member.id, { member, diff: [] });
      }
      let memberResult = resultsMap.get(member.id);
      if (!memberResult) {
        // 保険: ここに来ることは想定していないが型安全のため初期化
        memberResult = { member, diff: [] };
        resultsMap.set(member.id, memberResult);
      }

      // 進捗: タスク開始
      servicesState[key] = {
        ...servicesState[key],
        status: "in_progress",
        message: `${member.externalAccounts?.find((acc) => acc.service === diffItem.serviceGroup.service)?.name || member.id} を処理中...`,
      };

      onProgress?.({
        type: "progress",
        stage: "applying_changes",
        services: { ...servicesState },
        currentMember:
          member.externalAccounts?.find(
            (acc) => acc.service === diffItem.serviceGroup.service,
          )?.name || member.id,
      });

      if (diffItem.ignore) {
        const skipped: ApplyDiffResultItem = {
          ...diffItem,
          status: "skipped",
          reason: "Ignored",
        };
        memberResult.diff.push(skipped);
        servicesState[key] = {
          ...servicesState[key],
          status: "skipped",
          current: 1,
          message: `${servicesState[key].message} (skipped)`,
        };
        onProgress?.({
          type: "progress",
          stage: "applying_changes",
          services: { ...servicesState },
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

      // タスクの状態を更新
      if (resultItem.status === "success") {
        servicesState[key] = {
          ...servicesState[key],
          status: "completed",
          current: 1,
          success: 1,
          message: `${diffItem.serviceGroup.service} 処理完了`,
        };
      } else if (resultItem.status === "error") {
        servicesState[key] = {
          ...servicesState[key],
          status: "error",
          current: 1,
          errors: 1,
          message: `${diffItem.serviceGroup.service} でエラー発生`,
          error: resultItem.reason,
        };
      } else if (resultItem.status === "skipped") {
        servicesState[key] = {
          ...servicesState[key],
          status: "skipped",
          current: 1,
          message: `${diffItem.serviceGroup.service} はスキップ`,
        };
      }

      onProgress?.({
        type: "progress",
        stage: "applying_changes",
        services: { ...servicesState },
      });
    }

    // マップを配列にして完了報告
    const results: ApplyDiffResult[] = Array.from(resultsMap.values());
    onProgress?.({ type: "complete", result: results });
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
    if (diff.type === "invite-group") {
      const userId = ZVRCUserId.parse(diff.targetAccount.serviceId);
      const inviteResult = await inviteUserToGroup(
        serviceAccount,
        groupId,
        userId,
      );
      return {
        ...diff,
        status: inviteResult.status === "already" ? "skipped" : "success",
        reason: inviteResult.message,
      };
    }

    if (diff.type === "add" || diff.type === "remove") {
      const userId = ZVRCUserId.parse(diff.groupMember.serviceId);
      const roleId = ZVRCGroupRoleId.parse(diff.roleId);
      if (diff.type === "add") {
        await addRoleToGroupMember(serviceAccount, groupId, userId, roleId);
      } else {
        await removeRoleFromGroupMember(
          serviceAccount,
          groupId,
          userId,
          roleId,
        );
      }
      return {
        ...diff,
        status: "success",
      };
    }
    const _exhaustiveCheck: never = diff;
    throw new Error(
      `Unsupported diff type: ${(_exhaustiveCheck as { type: string }).type}`,
    );
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
  if (diff.type !== "add" && diff.type !== "remove") {
    return {
      ...diff,
      status: "error",
      reason: "Unsupported diff type for Discord",
    };
  }
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
  if (diff.type !== "add" && diff.type !== "remove") {
    return {
      ...diff,
      status: "error",
      reason: "Unsupported diff type for GitHub",
    };
  }
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
