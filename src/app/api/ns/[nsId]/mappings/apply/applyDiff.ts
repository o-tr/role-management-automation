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

export const applyDiff = async (
  nsId: TNamespaceId,
  members: TMemberWithDiff[],
): Promise<ApplyDiffResult[]> => {
  return await Promise.all(
    members.map(async ({ member, diff }) => {
      return {
        member,
        diff: await Promise.all(
          diff.map<Promise<ApplyDiffResultItem>>(async (diff) => {
            if (diff.ignore) {
              return {
                ...diff,
                status: "skipped",
                reason: "Ignored",
              };
            }
            switch (diff.serviceGroup.service) {
              case "VRCHAT":
                return await applyVRChatDiff(nsId, diff);
              case "DISCORD":
                return await applyDiscordDiff(nsId, diff);
              case "GITHUB":
                return await applyGitHubDiff(nsId, diff);
              default:
                throw new Error("Unsupported service");
            }
          }),
        ),
      };
    }),
  );
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
