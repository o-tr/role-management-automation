import type {
  TExternalServiceAccount,
  TExternalServiceAccountId,
  TNamespaceId,
} from "@/types/prisma";
import type { ExternalServiceAccount } from "@prisma/client";

export const formatTExternalServiceAccount = (
  input: ExternalServiceAccount,
): TExternalServiceAccount => {
  return {
    id: input.id as TExternalServiceAccountId,
    name: input.name,
    service: input.service,
    credential: input.credential,
    icon: input.icon || undefined,
    namespaceId: input.namespaceId as TNamespaceId,
  };
};
