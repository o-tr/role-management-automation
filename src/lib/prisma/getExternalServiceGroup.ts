import type {
  TExternalServiceAccountId,
  TExternalServiceGroupId,
  TExternalServiceGroupWithAccount,
  TNamespaceId,
} from "@/types/prisma";
import { prisma } from "../prisma";
import { formatTExternalServiceGroupWithAccount } from "./format/formatTExternalServiceGroupWithAccount";

export const getExternalServiceGroup = async (
  namespaceId: TNamespaceId,
  externalAccountId: TExternalServiceAccountId,
  externalGroupId: TExternalServiceGroupId,
): Promise<TExternalServiceGroupWithAccount | null> => {
  const result = await prisma.externalServiceGroup.findUnique({
    where: {
      id: externalGroupId,
      accountId: externalAccountId,
      namespaceId: namespaceId,
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
