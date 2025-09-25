import type { ExternalServiceName } from "@prisma/client";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { api } from "@/lib/api";
import { getSearchGuildMembers } from "@/lib/discord/requests/getSearchGuildMembers";
import { getUser } from "@/lib/discord/requests/getUser";
import type { DiscordGuildId } from "@/lib/discord/types/guild";
import type { DiscordUserId, DiscordUsername } from "@/lib/discord/types/user";
import { BadRequestException } from "@/lib/exceptions/BadRequestException";
import { NotFoundException } from "@/lib/exceptions/NotFoundException";
import { generateInstallationAccessToken } from "@/lib/github/generateInstallationAccessToken";
import { getUserById as getGitHubUserById } from "@/lib/github/requests/getUserById";
import { getUserByUsername as getGitHubUserByUsername } from "@/lib/github/requests/getUserByUsername";
import type {
  GitHubAccountId,
  GitHubAccountUsername,
} from "@/lib/github/types/Account";
import { ZGitHubGroupId } from "@/lib/github/types/encoded";
import { getExternalServiceAccountByServiceName } from "@/lib/prisma/getExternalServiceAccountByServiceName";
import { getExternalServiceGroupsByAccountId } from "@/lib/prisma/getExternalServiceGroupsByAccountId";
import { getMemberExternalServiceAccount } from "@/lib/prisma/getMemberExternalServiceAccount";
import { getMemberExternalServiceAccountByUsername } from "@/lib/prisma/getMemberExternalServiceAccountByUsername";
import { validatePermission } from "@/lib/validatePermission";
import { getUserById as getVRCUserById } from "@/lib/vrchat/requests/getUserById";
import type { VRCUserId } from "@/lib/vrchat/types/brand";
import type { ErrorResponseType } from "@/types/api";
import { ZDiscordCredentials } from "@/types/credentials";
import type {
  TExternalServiceAccount,
  TMemberId,
  TNamespaceId,
} from "@/types/prisma";

export const ZResolveRequestType = z.union([
  z.literal("DiscordUserId"),
  z.literal("DiscordUsername"),
  z.literal("VRCUserId"),
  z.literal("GitHubUserId"),
  z.literal("GitHubUsername"),
]);
export type TResolveRequestType = z.infer<typeof ZResolveRequestType>;

export type ResolveResponse =
  | {
      status: "success";
      item: ResolveResult;
    }
  | ErrorResponseType;

export const GET = api(
  async (
    _req: NextRequest,
    {
      params,
    }: { params: { nsId: TNamespaceId; type: string; serviceId: string } },
  ): Promise<ResolveResponse> => {
    const type = ZResolveRequestType.parse(params.type);
    validatePermission(params.nsId, "admin");

    const item = await resolve(type, params.serviceId, params.nsId);

    return {
      status: "success",
      item,
    };
  },
);

export type ResolveResult = {
  memberId?: TMemberId;
  name: string | null;
  icon?: string;
  service: ExternalServiceName;
  serviceId: string;
  serviceUsername?: string;
};

const resolve = async (
  type: TResolveRequestType,
  serviceId: string,
  nsId: TNamespaceId,
): Promise<ResolveResult> => {
  const service = requestType2Service(type);
  const serviceAccount = await getExternalServiceAccountByServiceName(
    nsId,
    service,
  );
  if (!serviceAccount) {
    throw new NotFoundException(`Service account not found: ${service}`);
  }
  switch (type) {
    case "VRCUserId":
      return resolveVRCUserId(serviceId as VRCUserId, serviceAccount);
    case "DiscordUserId":
      return resolveDiscordUserId(serviceId as DiscordUserId, serviceAccount);
    case "DiscordUsername":
      return resolveDiscordUserName(
        serviceId as DiscordUsername,
        serviceAccount,
      );
    case "GitHubUserId":
      return resolveGitHubUserId(
        Number(serviceId) as GitHubAccountId,
        serviceAccount,
      );
    case "GitHubUsername":
      return resolveGitHubUsername(
        serviceId as GitHubAccountUsername,
        serviceAccount,
      );
    default:
      throw new BadRequestException(`Unsupported service: ${service}`);
  }
};

const resolveVRCUserId = async (
  serviceId: VRCUserId,
  serviceAccount: TExternalServiceAccount,
): Promise<ResolveResult> => {
  const member = await getMemberExternalServiceAccount(
    serviceAccount.namespaceId,
    "VRCHAT",
    serviceId,
  );
  if (member) {
    return member;
  }
  const user = await getVRCUserById(serviceAccount, serviceId as VRCUserId);

  return {
    name: user.displayName,
    serviceId: serviceId,
    icon:
      user.profilePicOverrideThumbnail || user.currentAvatarThumbnailImageUrl,
    service: "VRCHAT" as ExternalServiceName,
  };
};

const resolveDiscordUserId = async (
  serviceId: DiscordUserId,
  serviceAccount: TExternalServiceAccount,
): Promise<ResolveResult> => {
  const member = await getMemberExternalServiceAccount(
    serviceAccount.namespaceId,
    "DISCORD",
    serviceId,
  );
  if (member) {
    return member;
  }
  const data = ZDiscordCredentials.parse(JSON.parse(serviceAccount.credential));
  const user = await getUser(data.token, serviceId);
  return {
    name: user.global_name,
    serviceId: user.id,
    serviceUsername: user.username,
    icon: user.avatar
      ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
      : undefined,
    service: "DISCORD" as ExternalServiceName,
  };
};

const resolveDiscordUserName = async (
  serviceUsername: DiscordUsername,
  serviceAccount: TExternalServiceAccount,
): Promise<ResolveResult> => {
  const member = await getMemberExternalServiceAccountByUsername(
    serviceAccount.namespaceId,
    "DISCORD",
    serviceUsername,
  );
  if (member) {
    return member;
  }
  const data = ZDiscordCredentials.parse(JSON.parse(serviceAccount.credential));
  const guilds = await getExternalServiceGroupsByAccountId(
    serviceAccount.namespaceId,
    serviceAccount.id,
  );
  if (!guilds) throw new NotFoundException("Guild not found");
  for (const guild of guilds) {
    const members = await getSearchGuildMembers(
      data.token,
      guild.groupId as DiscordGuildId,
      serviceUsername,
    );
    if (!members?.[0]) continue;
    const { user } = members[0];
    if (user.username !== serviceUsername) continue;
    return {
      name: user.global_name || user.username,
      serviceUsername: user.username,
      serviceId: user.id,
      icon: user.avatar
        ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
        : undefined,
      service: "DISCORD" as ExternalServiceName,
    };
  }
  throw new NotFoundException("User not found");
};

const resolveGitHubUserId = async (
  serviceId: GitHubAccountId,
  serviceAccount: TExternalServiceAccount,
): Promise<ResolveResult> => {
  const group = (
    await getExternalServiceGroupsByAccountId(
      serviceAccount.namespaceId,
      serviceAccount.id,
    )
  )?.[0];
  if (!group) throw new NotFoundException("Group not found");
  const { installationId } = ZGitHubGroupId.parse(JSON.parse(group.groupId));
  const token = await generateInstallationAccessToken(
    serviceAccount,
    installationId,
  );
  const user = await getGitHubUserById(token, serviceId);
  return {
    name: user.name || user.login,
    serviceId: user.id.toString(),
    serviceUsername: user.login,
    icon: user.avatar_url,
    service: "GITHUB" as ExternalServiceName,
  };
};

const resolveGitHubUsername = async (
  serviceId: GitHubAccountUsername,
  serviceAccount: TExternalServiceAccount,
): Promise<ResolveResult> => {
  const group = (
    await getExternalServiceGroupsByAccountId(
      serviceAccount.namespaceId,
      serviceAccount.id,
    )
  )?.[0];
  if (!group) throw new NotFoundException("Group not found");
  const { installationId } = ZGitHubGroupId.parse(JSON.parse(group.groupId));
  const token = await generateInstallationAccessToken(
    serviceAccount,
    installationId,
  );
  const user = await getGitHubUserByUsername(token, serviceId);
  return {
    name: user.name || user.login,
    serviceId: user.id.toString(),
    serviceUsername: user.login,
    icon: user.avatar_url,
    service: "GITHUB" as ExternalServiceName,
  };
};

const requestType2Service = (
  type: TResolveRequestType,
): ExternalServiceName => {
  switch (type) {
    case "DiscordUserId":
    case "DiscordUsername":
      return "DISCORD";
    case "VRCUserId":
      return "VRCHAT";
    case "GitHubUserId":
    case "GitHubUsername":
      return "GITHUB";
  }
};
