import { getBelongGuilds } from "@/lib/discord/requests/getBelongGuilds";
import { generateJWT } from "@/lib/github/generateJWT";
import { listInstallationsForAuthenticatedApp } from "@/lib/github/requests/listInstallationsForAuthenticatedApp";
import { getUserGroups } from "@/lib/vrchat/requests/getUserGroups";
import { ZDiscordCredentials, ZGithubCredentials } from "@/types/credentials";
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
    case "GITHUB":
      return await getGitHubAvailableOrganizations(serviceAccount);
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

const getGitHubAvailableOrganizations = async (
  serviceAccount: TExternalServiceAccount,
): Promise<TAvailableGroup[]> => {
  const credential = ZGithubCredentials.parse(
    JSON.parse(serviceAccount.credential),
  );
  const jwt = generateJWT(credential.clientId, credential.privateKey);
  const installations = await listInstallationsForAuthenticatedApp(jwt);
  return installations.map((installation) => ({
    id: installation.id,
    name: installation.account.login,
    icon: installation.account.avatar_url,
    href: installation.account.html_url,
  }));
};
