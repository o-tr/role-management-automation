import { api } from "@/lib/api";
import { getSearchGuildMembers } from "@/lib/discord/requests/getSerachGuildMembers";
import { getUser } from "@/lib/discord/requests/getUser";
import type { DiscordUserId, DiscordUsername } from "@/lib/discord/types/user";
import { getExternalServiceAccountByServiceName } from "@/lib/prisma/getExternalServiceAccountByServiceName";
import { getExternalServiceGroupsByAccountId } from "@/lib/prisma/getExternalServiceGroupsByAccountId";
import { getMemberExternalServiceAccount } from "@/lib/prisma/getMemberExternalServiceAccount";
import { getMemberExternalServiceAccountByUsername } from "@/lib/prisma/getMemberExternalServiceAccountByUsername";
import { validatePermission } from "@/lib/validatePermission";
import { getUserById } from "@/lib/vrchat/requests/getUserById";
import type { VRCUserId } from "@/lib/vrchat/types/brand";
import { ZDiscordCredentials } from "@/types/credentials";
import type { TExternalServiceAccount, TNamespaceId } from "@/types/prisma";
import type { ExternalServiceName } from "@prisma/client";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

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
  | {
      status: "error";
      error: string;
    };

export const GET = api(
  async (
    req: NextRequest,
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
  memberId?: string;
  name: string;
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
    throw new Error(`Service account not found: ${service}`);
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
    default:
      throw new Error(`Unsupported service: ${service}`);
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
  const user = await getUserById(serviceAccount, serviceId as VRCUserId);

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
  if (!guilds) throw new Error("Guild not found");
  for (const guild of guilds) {
    const members = await getSearchGuildMembers(
      data.token,
      guild.groupId,
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
  throw new Error("User not found");
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
