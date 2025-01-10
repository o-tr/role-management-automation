import { getGuild } from "@/lib/discord/requests/getGuild";
import { getGroup } from "@/lib/vrchat/requests/getGroup";
import { ZDiscordCredentials, ZVRChatCredentials } from "@/types/credentials";
import type { TExternalServiceGroup } from "@/types/prisma";
import type { ExternalServiceAccount } from "@prisma/client";

export const getGroupDetail = async (
  serviceAccount: ExternalServiceAccount,
  groupId: string,
): Promise<TExternalServiceGroup> => {
  switch (serviceAccount.service) {
    case "DISCORD":
      return getDiscordGroupDetail(serviceAccount, groupId);
    case "VRCHAT":
      return getVRChatGroupDetail(serviceAccount, groupId);
    default:
      throw new Error(`Unsupported service: ${serviceAccount.service}`);
  }
};

const getDiscordGroupDetail = async (
  serviceAccount: ExternalServiceAccount,
  groupId: string,
): Promise<TExternalServiceGroup> => {
  const data = ZDiscordCredentials.parse(JSON.parse(serviceAccount.credential));
  const guild = await getGuild(data.token, groupId);
  return {
    id: guild.id,
    name: guild.name,
    icon: guild.icon
      ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`
      : undefined,
  };
};

const getVRChatGroupDetail = async (
  serviceAccount: ExternalServiceAccount,
  groupId: string,
): Promise<TExternalServiceGroup> => {
  const data = ZVRChatCredentials.parse(JSON.parse(serviceAccount.credential));
  const group = await getGroup(data.token, data.twoFactorToken, groupId);
  return {
    id: group.id,
    name: group.name,
    icon: group.iconUrl,
  };
};
