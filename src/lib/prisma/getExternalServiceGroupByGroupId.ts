import type {
  TExternalServiceAccountId,
  TExternalServiceGroupWithAccount,
  TNamespaceId,
} from "@/types/prisma";
import { prisma } from "../prisma";
import { formatTExternalServiceGroupWithAccount } from "./format/formatTExternalServiceGroupWithAccount";

export const getExternalServiceGroupByGroupId = async (
  namespaceId: TNamespaceId,
  externalAccountId: TExternalServiceAccountId,
  groupId: string,
): Promise<TExternalServiceGroupWithAccount | null> => {
  const result = await prisma.externalServiceGroup.findFirst({
    where: {
      accountId: externalAccountId,
      namespaceId: namespaceId,
      groupId,
    },
    include: {
      account: true,
    },
  });
  if (!result) {
    return null;
  }
  return formatTExternalServiceGroupWithAccount(result);
};
