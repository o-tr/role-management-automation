import { getGuild } from "@/lib/discord/requests/getGuild";
import type { DiscordGuildId } from "@/lib/discord/types/guild";
import { getGroup } from "@/lib/vrchat/requests/getGroup";
import { ZDiscordCredentials, ZVRChatCredentials } from "@/types/credentials";
import type { TExternalServiceAccount } from "@/types/prisma";
import type { ExternalServiceName } from "@prisma/client";

type GroupDetailResult = {
  name: string;
  icon?: string;
  service: ExternalServiceName;
  groupId: string;
};

export const getGroupDetail = async (
  serviceAccount: TExternalServiceAccount,
  groupId: string,
): Promise<GroupDetailResult> => {
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
  serviceAccount: TExternalServiceAccount,
  groupId: string,
): Promise<GroupDetailResult> => {
  const data = ZDiscordCredentials.parse(JSON.parse(serviceAccount.credential));
  const guild = await getGuild(data.token, groupId as DiscordGuildId);
  return {
    name: guild.name,
    icon: guild.icon
      ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`
      : undefined,
    service: "DISCORD" as ExternalServiceName,
    groupId: guild.id,
  };
};

const getVRChatGroupDetail = async (
  serviceAccount: TExternalServiceAccount,
  groupId: string,
): Promise<GroupDetailResult> => {
  const group = await getGroup(serviceAccount, groupId);
  return {
    name: group.name,
    icon: group.iconUrl,
    service: "VRCHAT" as ExternalServiceName,
    groupId: group.id,
  };
};
