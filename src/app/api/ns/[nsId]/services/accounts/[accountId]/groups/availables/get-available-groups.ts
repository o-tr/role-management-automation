import { getBelongGuilds } from "@/lib/discord/requests/getBelongGuilds";
import { getUserGroups } from "@/lib/vrchat/requests/getUserGroups";
import { ZDiscordCredentials, ZVRChatCredentials } from "@/types/credentials";
import type { ExternalServiceAccount } from "@prisma/client";

export const getAvailableGroups = async (
  serviceAccount: ExternalServiceAccount,
) => {
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
  serviceAccount: ExternalServiceAccount,
) => {
  const data = ZDiscordCredentials.parse(JSON.parse(serviceAccount.credential));
  const guilds = await getBelongGuilds(data.token);
  return guilds.map((guild) => ({
    id: guild.id,
    name: guild.name,
    icon: guild.icon
      ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`
      : undefined,
    href: `https://discord.com/channels/${guild.id}`,
  }));
};

const getVRChatAvailableGroups = async (
  serviceAccount: ExternalServiceAccount,
) => {
  const data = ZVRChatCredentials.parse(JSON.parse(serviceAccount.credential));
  const groups = await getUserGroups(data.token, data.twoFactorToken, data.userId);
  return groups.map((group) => ({
    id: group.groupId,
    name: group.name,
    icon: group.iconUrl,
    href: `https://vrchat.com/home/group/${group.groupId}`,
  }));
}
