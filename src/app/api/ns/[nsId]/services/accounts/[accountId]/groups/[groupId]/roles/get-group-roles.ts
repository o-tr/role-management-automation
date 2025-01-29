import { getGuildRoles } from "@/lib/discord/requests/getGuildRoles";
import type { DiscordGuildId } from "@/lib/discord/types/guild";
import { getGroupRoles as getVRCGroupRoles } from "@/lib/vrchat/requests/getGroupRoles";
import { ZDiscordCredentials } from "@/types/credentials";
import type {
  TExternalServiceAccount,
  TExternalServiceGroup,
  TExternalServiceGroupRole,
} from "@/types/prisma";

export const getGroupRoles = async (
  serviceAccount: TExternalServiceAccount,
  serviceGroup: TExternalServiceGroup,
): Promise<TExternalServiceGroupRole[]> => {
  switch (serviceAccount.service) {
    case "DISCORD":
      return await getDiscordGroupRoles(serviceAccount, serviceGroup);
    case "VRCHAT":
      return await getVRChatGroupRoles(serviceAccount, serviceGroup);
    default:
      throw new Error(`Unsupported service: ${serviceAccount.service}`);
  }
};

const colorNumberToHex = (color: number) => {
  if (color === 0) {
    return undefined;
  }
  return `#${color.toString(16).padStart(6, "0")}`;
};

const getDiscordGroupRoles = async (
  serviceAccount: TExternalServiceAccount,
  serviceGroup: TExternalServiceGroup,
): Promise<TExternalServiceGroupRole[]> => {
  const data = ZDiscordCredentials.parse(JSON.parse(serviceAccount.credential));
  const roles = await getGuildRoles(
    data.token,
    serviceGroup.groupId as DiscordGuildId,
  );
  return roles.map((role) => ({
    id: role.id,
    name: role.name,
    color: colorNumberToHex(role.color),
    icon: role.icon || undefined,
  }));
};

const getVRChatGroupRoles = async (
  serviceAccount: TExternalServiceAccount,
  serviceGroup: TExternalServiceGroup,
): Promise<TExternalServiceGroupRole[]> => {
  const roles = await getVRCGroupRoles(serviceAccount, serviceGroup.groupId);
  return roles.map((role) => ({
    id: role.id,
    name: role.name,
  }));
};
