import type {
  TMemberExternalServiceAccount,
  TMemberExternalServiceAccountId,
  TNamespaceId,
} from "@/types/prisma";
import { prisma } from "../prisma";
import { formatTMemberExternalServiceAccount } from "./format/formatTMemberExternalServiceAccount";

export const getMemberExternalServiceAccountById = async (
  namespaceId: TNamespaceId,
  accountId: TMemberExternalServiceAccountId,
): Promise<TMemberExternalServiceAccount | null> => {
  const result = await prisma.memberExternalServiceAccount.findUnique({
    where: {
      id: accountId,
      namespaceId: namespaceId,
    },
  });

  if (!result) {
    return null;
  }

  return formatTMemberExternalServiceAccount(result);
};
