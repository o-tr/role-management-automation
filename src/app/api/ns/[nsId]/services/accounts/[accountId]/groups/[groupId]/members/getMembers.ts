import { listGuildMembers } from "@/lib/discord/requests/listGuildMembers";
import type {
  DiscordGuildId,
  DiscordGuildMember,
} from "@/lib/discord/types/guild";
import { getAuthUser } from "@/lib/vrchat/requests/getAuthUser";
import { getGroup } from "@/lib/vrchat/requests/getGroup";
import { listGroupMembers } from "@/lib/vrchat/requests/listGroupMembers";
import type { VRCGroupMember } from "@/lib/vrchat/types/GroupMember";
import { ZVRCGroupId } from "@/lib/vrchat/types/brand";
import { ZVRChatCredentials } from "@/types/credentials";
import type {
  TExternalServiceGroupMember,
  TExternalServiceGroupWithAccount,
} from "@/types/prisma";

export const getMembers = async (
  group: TExternalServiceGroupWithAccount,
): Promise<TExternalServiceGroupMember[]> => {
  switch (group.account.service) {
    case "VRCHAT":
      return getVRChatMembers(group);
    case "DISCORD":
      return getDiscordMembers(group);
    default:
      throw new Error(`Unknown service: ${group.account.service}`);
  }
};

const getVRChatMembers = async (
  group: TExternalServiceGroupWithAccount,
): Promise<TExternalServiceGroupMember[]> => {
  const groupId = ZVRCGroupId.parse(group.groupId);
  const members: VRCGroupMember[] = [];
  let offset = 0;
  let requestResult: VRCGroupMember[];
  do {
    requestResult = await listGroupMembers(group.account, groupId, {
      offset,
      limit: 100,
    });
    members.push(...requestResult);
    offset += 100;
  } while (requestResult.length > 0);

  const credentials = ZVRChatCredentials.parse(
    JSON.parse(group.account.credential),
  );
  const user = await getAuthUser(credentials.token, credentials.twoFactorToken);
  const vrcGroup = await getGroup(group.account, groupId);
  members.push({
    ...vrcGroup.myMember,
    user: {
      id: user.id,
      displayName: user.displayName,
      thumbnailUrl: user.profilePicOverrideThumbnail,
      iconUrl:
        user.userIcon ||
        user.profilePicOverrideThumbnail ||
        user.currentAvatarThumbnailImageUrl,
      currentAvatarThumbnailImageUrl: user.currentAvatarThumbnailImageUrl,
    },
  });
  return members.map((member) => ({
    serviceId: member.userId,
    name: member.user.displayName,
    icon: member.user.iconUrl,
    roleIds: member.roleIds,
  }));
};

const getDiscordMembers = async (
  group: TExternalServiceGroupWithAccount,
): Promise<TExternalServiceGroupMember[]> => {
  const token = JSON.parse(group.account.credential).token;
  const members: DiscordGuildMember[] = [];
  let maxUserId = 0;
  let requestResult: DiscordGuildMember[];
  const processedUserIds = new Set<string>();
  do {
    requestResult = await listGuildMembers(
      token,
      group.groupId as DiscordGuildId,
      {
        after: maxUserId,
        limit: 100,
      },
    );
    const filteredMembers = requestResult.filter(
      (member) => !processedUserIds.has(member.user.id),
    );
    members.push(...requestResult);
    for (const member of filteredMembers) {
      processedUserIds.add(member.user.id);
    }
    maxUserId = Math.max(...members.map((member) => Number(member.user.id)));
  } while (requestResult.length > 0);
  return members.map((member) => ({
    serviceId: member.user.id,
    name: member.user.global_name || member.user.username,
    serviceUsername: member.user.username,
    icon: member.user.avatar || undefined,
    roleIds: member.roles,
  }));
};
