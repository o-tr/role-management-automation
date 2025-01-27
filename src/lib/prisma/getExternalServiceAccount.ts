import type {
  TExternalServiceAccount,
  TExternalServiceAccountId,
  TNamespaceId,
} from "@/types/prisma";
import { prisma } from "../prisma";
import { formatTExternalServiceAccount } from "./format/formatTExternalServiceAccount";

export const getExternalServiceAccount = async (
  namespaceId: TNamespaceId,
  accountId: TExternalServiceAccountId,
): Promise<TExternalServiceAccount | null> => {
  const result = await prisma.externalServiceAccount.findUnique({
    where: {
      namespaceId: namespaceId,
      id: accountId,
    },
  });
  if (!result) {
    return null;
  }
  return formatTExternalServiceAccount(result);
};
