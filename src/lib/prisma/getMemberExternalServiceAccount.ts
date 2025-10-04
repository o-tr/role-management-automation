import type {
  TMemberExternalServiceAccount,
  TNamespaceId,
} from "@/types/prisma";
import type { DiscordUserId } from "../discord/types/user";
import { prisma } from "../prisma";
import type { VRCUserId } from "../vrchat/types/brand";
import { formatTMemberExternalServiceAccount } from "./format/formatTMemberExternalServiceAccount";

interface ArgumentMap {
  VRCHAT: VRCUserId;
  DISCORD: DiscordUserId;
  GITHUB: string;
}

export const getMemberExternalServiceAccount = async <
  T extends keyof ArgumentMap,
>(
  namespaceId: TNamespaceId,
  service: T,
  serviceId: ArgumentMap[T],
): Promise<TMemberExternalServiceAccount | null> => {
  const result = await prisma.memberExternalServiceAccount.findFirst({
    where: {
      service: service,
      serviceId: serviceId,
      namespaceId: namespaceId,
    },
  });
  if (!result) {
    return null;
  }
  return formatTMemberExternalServiceAccount(result);
};
