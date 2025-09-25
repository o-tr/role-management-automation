import { listGuildMembers } from "@/lib/discord/requests/listGuildMembers";
import type {
  DiscordGuildId,
  DiscordGuildMember,
} from "@/lib/discord/types/guild";
import { generateInstallationAccessToken } from "@/lib/github/generateInstallationAccessToken";
import { listOrganizationMembers } from "@/lib/github/requests/listOrganizationMembers";
import { listTeamMembers } from "@/lib/github/requests/listTeamMembers";
import { listTeams } from "@/lib/github/requests/listTeams";
import type { GitHubInstallationAccessToken } from "@/lib/github/types/AccessToken";
import type {
  GitHubAccount,
  GitHubOrganizationId,
} from "@/lib/github/types/Account";
import type { GitHubTeamSlug } from "@/lib/github/types/Team";
import { type GitHubRoleId, ZGitHubGroupId } from "@/lib/github/types/encoded";
import { getAuthUser } from "@/lib/vrchat/requests/getAuthUser";
import { getGroup } from "@/lib/vrchat/requests/getGroup";
import { getGroupRoles } from "@/lib/vrchat/requests/getGroupRoles";
import { listGroupMembers } from "@/lib/vrchat/requests/listGroupMembers";
import type { VRCGroupMember } from "@/lib/vrchat/types/GroupMember";
import type { VRCGroupRole } from "@/lib/vrchat/types/GroupRole";
import { ZVRCGroupId } from "@/lib/vrchat/types/brand";
import {
  ZDiscordCredentials,
  ZGithubCredentials,
  ZVRChatCredentials,
} from "@/types/credentials";
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
    case "GITHUB":
      return getGitHubMembers(group);
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

  const roles = await getGroupRoles(group.account, groupId);
  const serviceAccountOrder = getHighestRole(
    roles,
    vrcGroup.myMember.roleIds || [],
  )?.order;

  if (!serviceAccountOrder) {
    throw new Error("Service account has no role in the group");
  }

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
    roleIds: member.roleIds || [],
    isEditable:
      (getHighestRole(roles, member.roleIds || [])?.order ||
        Number.MAX_SAFE_INTEGER) > serviceAccountOrder ||
      member.user.id === user.id,
  }));
};

const getHighestRole = (
  roles: VRCGroupRole[],
  roleIds: string[],
): VRCGroupRole | undefined => {
  return roles
    .filter((role) => roleIds.includes(role.id))
    .sort((a, b) => a.order - b.order)[0];
};

const getDiscordMembers = async (
  group: TExternalServiceGroupWithAccount,
): Promise<TExternalServiceGroupMember[]> => {
  const token = ZDiscordCredentials.parse(
    JSON.parse(group.account.credential),
  ).token;
  const members: DiscordGuildMember[] = [];
  let maxUserId = "0";
  let requestResult: DiscordGuildMember[];
  const processedUserIds = new Set<string>();
  let noChangeCount = 0;
  const maxNoChangeCount = 2;

  do {
    const previousMaxUserId = maxUserId;
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

    if (requestResult.length > 0) {
      maxUserId = requestResult[requestResult.length - 1].user.id;
    }

    // IDが変動しなかった場合のカウンターを更新
    if (maxUserId === previousMaxUserId) {
      noChangeCount++;
    } else {
      noChangeCount = 0;
    }

    // 2回連続でIDが変動しなかった場合は終了
    if (noChangeCount >= maxNoChangeCount) {
      break;
    }
  } while (requestResult.length > 0);
  return members.map((member) => ({
    serviceId: member.user.id,
    name: member.user.global_name || member.user.username,
    serviceUsername: member.user.username,
    icon: member.user.avatar || undefined,
    roleIds: member.roles,
    isEditable: true,
  }));
};

const getGitHubMembers = async (
  group: TExternalServiceGroupWithAccount,
): Promise<TExternalServiceGroupMember[]> => {
  const { installationId, accountId } = ZGitHubGroupId.parse(
    JSON.parse(group.groupId),
  );
  const organizationId = accountId as GitHubOrganizationId;
  const token = await generateInstallationAccessToken(
    group.account,
    installationId,
  );
  const teams = await listTeams(token, organizationId);
  const members = await getGitHubOrgMembers(token, organizationId);
  const teamMembers = await Promise.all(
    teams.map((team) =>
      getGitHubTeamMembers(token, organizationId, team.slug).then(
        (members) => ({
          id: team.id,
          slug: team.slug,
          memberIds: members.map((member) => member.id),
        }),
      ),
    ),
  );

  return members.map((member) => ({
    serviceId: `${member.id}`,
    name: member.name || member.login,
    icon: member.avatar_url,
    serviceUsername: member.login,
    roleIds: teamMembers
      .filter((team) => team.memberIds.includes(member.id))
      .map((team) =>
        JSON.stringify({
          teamId: team.id,
          teamSlug: team.slug,
        } satisfies GitHubRoleId),
      ),
    isEditable: true,
  }));
};

const getGitHubOrgMembers = async (
  token: GitHubInstallationAccessToken,
  organizationId: GitHubOrganizationId,
): Promise<GitHubAccount[]> => {
  const members: GitHubAccount[] = [];
  let requestResult: GitHubAccount[];
  let page = 1;
  do {
    requestResult = await listOrganizationMembers(token, organizationId, {
      per_page: 100,
      page: page++,
    });
    members.push(...requestResult);
  } while (requestResult.length > 0);
  return members;
};

const getGitHubTeamMembers = async (
  token: GitHubInstallationAccessToken,
  organizationId: GitHubOrganizationId,
  teamSlug: GitHubTeamSlug,
): Promise<GitHubAccount[]> => {
  const members: GitHubAccount[] = [];
  let requestResult: GitHubAccount[];
  let page = 1;
  do {
    requestResult = await listTeamMembers(token, organizationId, teamSlug, {
      per_page: 100,
      page: page++,
    });
    members.push(...requestResult);
  } while (requestResult.length > 0);
  return members;
};
