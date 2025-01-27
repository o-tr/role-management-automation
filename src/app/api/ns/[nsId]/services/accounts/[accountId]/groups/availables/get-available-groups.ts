import { getBelongGuilds } from "@/lib/discord/requests/getBelongGuilds";
import { getUserGroups } from "@/lib/vrchat/requests/getUserGroups";
import { ZDiscordCredentials } from "@/types/credentials";
import type {
  TAvailableGroup,
  TAvailableGroupId,
  TExternalServiceAccount,
} from "@/types/prisma";

export const getAvailableGroups = async (
  serviceAccount: TExternalServiceAccount,
): Promise<TAvailableGroup[]> => {
  switch (serviceAccount.service) {
    case "DISCORD":
      return await getDiscordAvailableGroups(serviceAccount);
    case "VRCHAT":
      return await getVRChatAvailableGroups(serviceAccount);
    default:
      throw new Error(`Unsupported service: ${serviceAccount.service}`);
  }
};

const getDiscordAvailableGroups = async (
  serviceAccount: TExternalServiceAccount,
): Promise<TAvailableGroup[]> => {
  const data = ZDiscordCredentials.parse(JSON.parse(serviceAccount.credential));
  const guilds = await getBelongGuilds(data.token);
  return guilds.map((guild) => ({
    id: guild.id as TAvailableGroupId,
    name: guild.name,
    icon: guild.icon
      ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`
      : undefined,
    href: `https://discord.com/channels/${guild.id}`,
  }));
};

const getVRChatAvailableGroups = async (
  serviceAccount: TExternalServiceAccount,
): Promise<TAvailableGroup[]> => {
  const groups = await getUserGroups(serviceAccount);
  return groups.map((group) => ({
    id: group.groupId,
    name: group.name,
    icon: group.iconUrl,
    href: `https://vrchat.com/home/group/${group.groupId}`,
  }));
};
