import {
  type TExternalServiceAccount,
  TExternalServiceAccountId,
  type TNamespaceId,
} from "@/types/prisma";
import type { ExternalServiceName } from "@prisma/client";
import { prisma } from "../prisma";
import { formatTExternalServiceAccount } from "./format/formatTExternalServiceAccount";

export const getExternalServiceAccountByServiceName = async (
  namespaceId: TNamespaceId,
  service: ExternalServiceName,
): Promise<TExternalServiceAccount | null> => {
  const result = await prisma.externalServiceAccount.findFirst({
    where: {
      namespaceId: namespaceId,
      service: service,
    },
  });
  if (!result) {
    return null;
  }
  return formatTExternalServiceAccount(result);
};
