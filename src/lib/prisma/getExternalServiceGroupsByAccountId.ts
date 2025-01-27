import type {
  TExternalServiceAccountId,
  TExternalServiceGroupId,
  TExternalServiceGroupWithAccount,
  TNamespaceId,
} from "@/types/prisma";
import { prisma } from "../prisma";
import { formatTExternalServiceGroupWithAccount } from "./format/formatTExternalServiceGroupWithAccount";

export const getExternalServiceGroupsByAccountId = async (
  namespaceId: TNamespaceId,
  externalAccountId: TExternalServiceAccountId,
): Promise<TExternalServiceGroupWithAccount[]> => {
  const result = await prisma.externalServiceGroup.findMany({
    where: {
      accountId: externalAccountId,
      namespaceId: namespaceId,
    },
    include: {
      account: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });
  return result.map(formatTExternalServiceGroupWithAccount);
};
