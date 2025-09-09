import { getGuild } from "@/lib/discord/requests/getGuild";
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

export type ProgressCallback = (current: number, total?: number) => void;

export const getMembersWithProgress = async (
  group: TExternalServiceGroupWithAccount,
  onProgress?: ProgressCallback,
): Promise<TExternalServiceGroupMember[]> => {
  switch (group.account.service) {
    case "VRCHAT":
      return getVRChatMembersWithProgress(group, onProgress);
    case "DISCORD":
      return getDiscordMembersWithProgress(group, onProgress);
    case "GITHUB":
      return getGitHubMembersWithProgress(group, onProgress);
    default:
      throw new Error(`Unknown service: ${group.account.service}`);
  }
};

const getVRChatMembersWithProgress = async (
  group: TExternalServiceGroupWithAccount,
  onProgress?: ProgressCallback,
): Promise<TExternalServiceGroupMember[]> => {
  const groupId = ZVRCGroupId.parse(group.groupId);
  const members: VRCGroupMember[] = [];
  let offset = 0;
  let requestResult: VRCGroupMember[];
  let totalFetched = 0;

  onProgress?.(0);

  do {
    requestResult = await listGroupMembers(group.account, groupId, {
      offset,
      limit: 100,
    });
    members.push(...requestResult);
    totalFetched += requestResult.length;
    offset += 100;

    // 進捗報告 (VRChatは総数が事前にわからないため、現在取得数のみ報告)
    onProgress?.(totalFetched);
  } while (requestResult.length > 0);

  const credentials = ZVRChatCredentials.parse(
    JSON.parse(group.account.credential),
  );
  const user = await getAuthUser(credentials.token, credentials.twoFactorToken);
  const vrcGroup = await getGroup(group.account, groupId);

  const roles = await getGroupRoles(group.account, groupId);
  const serviceAccountOrder = getHighestRole(
    roles,
    vrcGroup.myMember.roleIds,
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

  const result = members.map((member) => ({
    serviceId: member.userId,
    name: member.user.displayName,
    icon: member.user.iconUrl,
    roleIds: member.roleIds,
    isEditable:
      (getHighestRole(roles, member.roleIds)?.order ||
        Number.MAX_SAFE_INTEGER) > serviceAccountOrder ||
      member.user.id === user.id,
  }));

  // 最終的な総数で進捗報告
  onProgress?.(result.length, result.length);

  return result;
};

const getHighestRole = (
  roles: VRCGroupRole[],
  roleIds: string[],
): VRCGroupRole | undefined => {
  return roles
    .filter((role) => roleIds.includes(role.id))
    .sort((a, b) => a.order - b.order)[0];
};

const getDiscordMembersWithProgress = async (
  group: TExternalServiceGroupWithAccount,
  onProgress?: ProgressCallback,
): Promise<TExternalServiceGroupMember[]> => {
  const token = ZDiscordCredentials.parse(
    JSON.parse(group.account.credential),
  ).token;

  // まずGuild情報を取得してapproximate_member_countを取得
  const guild = await getGuild(token, group.groupId as DiscordGuildId);
  const approximateMemberCount = guild.approximate_member_count || undefined;

  const members: DiscordGuildMember[] = [];
  let maxUserId = 0;
  let requestResult: DiscordGuildMember[];
  const processedUserIds = new Set<string>();
  let totalFetched = 0;

  // 初期進捗（概算メンバー数がわかっている場合はそれを使用）
  onProgress?.(0, approximateMemberCount);

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
    totalFetched += filteredMembers.length;

    for (const member of filteredMembers) {
      processedUserIds.add(member.user.id);
    }
    maxUserId = Math.max(...members.map((member) => Number(member.user.id)));

    // 進捗報告（概算メンバー数と比較）
    onProgress?.(totalFetched, approximateMemberCount);
  } while (requestResult.length > 0);

  const result = members.map((member) => ({
    serviceId: member.user.id,
    name: member.user.global_name || member.user.username,
    serviceUsername: member.user.username,
    icon: member.user.avatar || undefined,
    roleIds: member.roles,
    isEditable: true,
  }));

  // 最終的な総数で進捗報告
  onProgress?.(result.length, result.length);

  return result;
};

const getGitHubMembersWithProgress = async (
  group: TExternalServiceGroupWithAccount,
  onProgress?: ProgressCallback,
): Promise<TExternalServiceGroupMember[]> => {
  const { installationId, accountId } = ZGitHubGroupId.parse(
    JSON.parse(group.groupId),
  );
  const organizationId = accountId as GitHubOrganizationId;
  const token = await generateInstallationAccessToken(
    group.account,
    installationId,
  );

  onProgress?.(0);

  // まずTeams一覧を取得
  const teams = await listTeams(token, organizationId);
  onProgress?.(1);

  // Organization members取得
  const members = await getGitHubOrgMembersWithProgress(
    token,
    organizationId,
    (current) => {
      onProgress?.(1 + current); // teams取得(1) + members取得進捗
    },
  );

  // Team members取得 (並行実行)
  const teamMembersPromises = teams.map(async (team, index) => {
    const teamMembers = await getGitHubTeamMembersWithProgress(
      token,
      organizationId,
      team.slug,
      (current) => {
        // team別の進捗は詳細すぎるので、ここでは報告しない
      },
    );

    // 各team完了時に進捗更新
    onProgress?.(1 + members.length + index + 1);

    return {
      id: team.id,
      slug: team.slug,
      memberIds: teamMembers.map((member) => member.id),
    };
  });

  const teamMembers = await Promise.all(teamMembersPromises);

  const result = members.map((member) => ({
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

  // 最終進捗報告
  onProgress?.(result.length, result.length);

  return result;
};

const getGitHubOrgMembersWithProgress = async (
  token: GitHubInstallationAccessToken,
  organizationId: GitHubOrganizationId,
  onProgress?: ProgressCallback,
): Promise<GitHubAccount[]> => {
  const members: GitHubAccount[] = [];
  let requestResult: GitHubAccount[];
  let page = 1;
  let totalFetched = 0;

  do {
    requestResult = await listOrganizationMembers(token, organizationId, {
      per_page: 100,
      page: page++,
    });
    members.push(...requestResult);
    totalFetched += requestResult.length;

    // 進捗報告
    onProgress?.(totalFetched);
  } while (requestResult.length > 0);

  return members;
};

const getGitHubTeamMembersWithProgress = async (
  token: GitHubInstallationAccessToken,
  organizationId: GitHubOrganizationId,
  teamSlug: GitHubTeamSlug,
  onProgress?: ProgressCallback,
): Promise<GitHubAccount[]> => {
  const members: GitHubAccount[] = [];
  let requestResult: GitHubAccount[];
  let page = 1;
  let totalFetched = 0;

  do {
    requestResult = await listTeamMembers(token, organizationId, teamSlug, {
      per_page: 100,
      page: page++,
    });
    members.push(...requestResult);
    totalFetched += requestResult.length;

    // 進捗報告
    onProgress?.(totalFetched);
  } while (requestResult.length > 0);

  return members;
};
