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
import { ZGitHubGroupId, ZGitHubRoleId } from "@/lib/github/types/encoded";
import type { GitHubTeamSlug } from "@/lib/github/types/Team";
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
import type { TExternalServiceAccount, TNamespaceId } from "@/types/prisma";

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
    type ServiceName = TDiffItem["serviceGroup"]["service"];
    type Member = (typeof members)[number]["member"];
    type Task = {
      key: string;
      member: Member;
      memberIndex: number;
      diffIndex: number;
      diffItem: TDiffItem;
      service: ServiceName;
      accountName: string;
    };

    const tasks: Task[] = [];
    for (let mi = 0; mi < members.length; mi++) {
      const { member, diff } = members[mi];
      for (let di = 0; di < diff.length; di++) {
        const diffItem = diff[di];
        const accountName =
          member.externalAccounts?.find(
            (acc) => acc.service === diffItem.serviceGroup.service,
          )?.name || member.id;
        const key = makeDiffKeyFromItem(mi, di, diffItem);
        tasks.push({
          key,
          member,
          memberIndex: mi,
          diffIndex: di,
          diffItem,
          service: diffItem.serviceGroup.service,
          accountName,
        });
      }
    }

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
      tasks.map((t) => [
        t.key,
        {
          status: "pending",
          current: 0,
          total: 1,
          success: 0,
          errors: 0,
          message: `${t.diffItem.serviceGroup.service} - ${t.accountName} の準備中...`,
        },
      ]),
    );

    onProgress?.({
      type: "progress",
      stage: "applying_changes",
      services: servicesState,
    });

    const tasksByService = tasks.reduce<Map<ServiceName, Task[]>>(
      (acc, task) => {
        const serviceTasks = acc.get(task.service);
        if (serviceTasks) {
          serviceTasks.push(task);
        } else {
          acc.set(task.service, [task]);
        }
        return acc;
      },
      new Map<ServiceName, Task[]>(),
    );

    const serviceAccountPromiseCache = new Map<
      ServiceName,
      Promise<TExternalServiceAccount | null>
    >();
    const getServiceAccount = (service: ServiceName) => {
      const cached = serviceAccountPromiseCache.get(service);
      if (cached) {
        return cached;
      }
      const promise = getExternalServiceAccountByServiceName(nsId, service);
      serviceAccountPromiseCache.set(service, promise);
      return promise;
    };

    const memberResultStore = new Map<
      number,
      { member: Member; diff: Array<ApplyDiffResultItem | undefined> }
    >();
    for (let mi = 0; mi < members.length; mi++) {
      memberResultStore.set(mi, {
        member: members[mi].member,
        diff: new Array(members[mi].diff.length).fill(undefined),
      });
    }

    const processTask = async (task: Task): Promise<void> => {
      const { key, diffItem, memberIndex, diffIndex, service, accountName } =
        task;

      servicesState[key] = {
        ...servicesState[key],
        status: "in_progress",
        message: `${accountName} を処理中...`,
      };
      onProgress?.({
        type: "progress",
        stage: "applying_changes",
        services: { ...servicesState },
        currentMember: accountName,
      });

      let resultItem: ApplyDiffResultItem;
      if (diffItem.ignore) {
        resultItem = {
          ...diffItem,
          status: "skipped",
          reason: "Ignored",
        };
      } else {
        try {
          const serviceAccount = await getServiceAccount(service);
          switch (service) {
            case "VRCHAT":
              resultItem = await applyVRChatDiff(serviceAccount, diffItem);
              break;
            case "DISCORD":
              resultItem = await applyDiscordDiff(serviceAccount, diffItem);
              break;
            case "GITHUB":
              resultItem = await applyGitHubDiff(serviceAccount, diffItem);
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
      }

      const memberResult = memberResultStore.get(memberIndex);
      if (memberResult) {
        memberResult.diff[diffIndex] = resultItem;
      }

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
    };

    await Promise.all(
      Array.from(tasksByService.values()).map(async (serviceTasks) => {
        for (const task of serviceTasks) {
          await processTask(task);
        }
      }),
    );

    const results: ApplyDiffResult[] = Array.from(memberResultStore.entries())
      .sort(([a], [b]) => a - b)
      .map(([, result]) => ({
        member: result.member,
        diff: result.diff.filter(
          (item): item is ApplyDiffResultItem => item !== undefined,
        ),
      }))
      .filter((result) => result.diff.length > 0);

    onProgress?.({ type: "complete", result: results });
  } catch (error) {
    onProgress?.({
      type: "error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

const applyVRChatDiff = async (
  serviceAccount: TExternalServiceAccount | null,
  diff: TDiffItem,
): Promise<ApplyDiffResultItem> => {
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
  serviceAccount: TExternalServiceAccount | null,
  diff: TDiffItem,
): Promise<ApplyDiffResultItem> => {
  if (diff.type !== "add" && diff.type !== "remove") {
    return {
      ...diff,
      status: "error",
      reason: "Unsupported diff type for Discord",
    };
  }
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
  serviceAccount: TExternalServiceAccount | null,
  diff: TDiffItem,
): Promise<ApplyDiffResultItem> => {
  if (diff.type !== "add" && diff.type !== "remove") {
    return {
      ...diff,
      status: "error",
      reason: "Unsupported diff type for GitHub",
    };
  }
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
