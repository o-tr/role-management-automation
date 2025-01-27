import type { TExternalServiceAccount, TNamespaceId } from "@/types/prisma";
import { prisma } from "../prisma";
import { formatTExternalServiceAccount } from "./format/formatTExternalServiceAccount";

export const getExternalServiceAccounts = async (
  namespaceId: TNamespaceId,
): Promise<TExternalServiceAccount[]> => {
  const result = await prisma.externalServiceAccount.findMany({
    where: {
      namespaceId: namespaceId,
    },
    orderBy: {
      createdAt: "asc",
    },
  });
  return result.map(formatTExternalServiceAccount);
};
