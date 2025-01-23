import { getGuildRoles } from "@/lib/discord/requests/getGuildRoles";
import { getGroupRoles as getVRCGroupRoles } from "@/lib/vrchat/requests/getGroupRoles";
import { ZDiscordCredentials, ZVRChatCredentials } from "@/types/credentials";
import type { TExternalServiceGroupRole } from "@/types/prisma";
import type {
  ExternalServiceAccount,
  ExternalServiceGroup,
} from "@prisma/client";

export const getGroupRoles = async (
  serviceAccount: ExternalServiceAccount,
  serviceGroup: ExternalServiceGroup,
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
  serviceAccount: ExternalServiceAccount,
  serviceGroup: ExternalServiceGroup,
): Promise<TExternalServiceGroupRole[]> => {
  const data = ZDiscordCredentials.parse(JSON.parse(serviceAccount.credential));
  const roles = await getGuildRoles(data.token, serviceGroup.groupId);
  return roles.map((role) => ({
    id: role.id,
    name: role.name,
    color: colorNumberToHex(role.color),
    icon: role.icon || undefined,
  }));
};

const getVRChatGroupRoles = async (
  serviceAccount: ExternalServiceAccount,
  serviceGroup: ExternalServiceGroup,
): Promise<TExternalServiceGroupRole[]> => {
  const data = ZVRChatCredentials.parse(JSON.parse(serviceAccount.credential));
  const roles = await getVRCGroupRoles(data, serviceGroup.groupId);
  return roles.map((role) => ({
    id: role.id,
    name: role.name,
  }));
};
