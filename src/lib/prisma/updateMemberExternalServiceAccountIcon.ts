import type {
  TMemberExternalServiceAccountId,
  TNamespaceId,
} from "@/types/prisma";
import { prisma } from "../prisma";

export const updateMemberExternalServiceAccountIcon = async (
  namespaceId: TNamespaceId,
  accountId: TMemberExternalServiceAccountId,
  icon: string | undefined,
): Promise<void> => {
  await prisma.memberExternalServiceAccount.update({
    where: {
      id: accountId,
      namespaceId: namespaceId,
    },
    data: {
      icon: icon,
    },
  });
};
