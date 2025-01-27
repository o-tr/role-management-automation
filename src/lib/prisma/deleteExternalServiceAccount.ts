import type { TExternalServiceAccountId, TNamespaceId } from "@/types/prisma";
import { prisma } from "../prisma";

export const deleteExternalServiceAccount = async (
  namespaceId: TNamespaceId,
  accountId: TExternalServiceAccountId,
): Promise<void> => {
  await prisma.externalServiceAccount.delete({
    where: {
      namespaceId: namespaceId,
      id: accountId,
    },
  });
};
