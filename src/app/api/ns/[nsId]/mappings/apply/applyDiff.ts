import { addGuildMemberRole } from "@/lib/discord/requests/addGuildMemberRole";
import { deleteGuildMemberRole } from "@/lib/discord/requests/deleteGuildMemberRole";
import type {
  DiscordGuildId,
  DiscordGuildRoleId,
} from "@/lib/discord/types/guild";
import type { DiscordUserId } from "@/lib/discord/types/user";
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

export type ApplyDiffResultItem = TDiffItem & {
  success: boolean;
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
          diff.map(async (diff) => {
            if (diff.ignore) {
              return {
                ...diff,
                success: false,
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
      success: false,
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
      success: true,
    };
  } catch (e) {
    if (e instanceof Error) {
      return {
        ...diff,
        success: false,
        reason: e.message,
      };
    }
    return {
      ...diff,
      success: false,
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
      success: false,
      reason: "Service account not found",
    };
  }
  const credentials = ZDiscordCredentials.safeParse(
    JSON.parse(serviceAccount.credential),
  );
  if (!credentials.success) {
    return {
      ...diff,
      success: false,
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
      success: true,
    };
  } catch (e) {
    if (e instanceof Error) {
      return {
        ...diff,
        success: false,
        reason: e.message,
      };
    }
    return {
      ...diff,
      success: false,
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
      success: false,
      reason: "Service account not found",
    };
  }
  return {
    ...diff,
    success: false,
    reason: "Not implemented",
  };
};
