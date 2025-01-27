import type {
  TExternalServiceAccountId,
  TExternalServiceGroupWithAccount,
  TNamespaceId,
} from "@/types/prisma";
import { prisma } from "../prisma";
import { formatTExternalServiceGroupWithAccount } from "./format/formatTExternalServiceGroupWithAccount";

export const getExternalServiceGroups = async (
  namespaceId: TNamespaceId,
): Promise<TExternalServiceGroupWithAccount[]> => {
  const result = await prisma.externalServiceGroup.findMany({
    where: {
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
