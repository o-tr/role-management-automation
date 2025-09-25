import type {
  TMemberExternalServiceAccount,
  TNamespaceId,
} from "@/types/prisma";
import type { DiscordUsername } from "../discord/types/user";
import { prisma } from "../prisma";
import { formatTMemberExternalServiceAccount } from "./format/formatTMemberExternalServiceAccount";

interface ArgumentMap {
  DISCORD: DiscordUsername;
}

export const getMemberExternalServiceAccountByUsername = async <
  T extends keyof ArgumentMap,
>(
  namespaceId: TNamespaceId,
  service: T,
  serviceUsername: ArgumentMap[T],
): Promise<TMemberExternalServiceAccount | null> => {
  const result = await prisma.memberExternalServiceAccount.findFirst({
    where: {
      service: service,
      serviceUsername: serviceUsername,
      namespaceId: namespaceId,
    },
  });
  if (!result) {
    return null;
  }
  return formatTMemberExternalServiceAccount(result);
};
