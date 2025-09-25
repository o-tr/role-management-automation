import type { ExternalAccountStatus } from "@prisma/client";
import type {
  TMemberExternalServiceAccountId,
  TNamespaceId,
} from "@/types/prisma";
import { prisma } from "../prisma";

export const updateMemberExternalServiceAccountStatus = async (
  namespaceId: TNamespaceId,
  accountId: TMemberExternalServiceAccountId,
  status: ExternalAccountStatus,
): Promise<void> => {
  await prisma.memberExternalServiceAccount.update({
    where: {
      id: accountId,
      namespaceId: namespaceId,
    },
    data: {
      status: status,
    },
  });
};
