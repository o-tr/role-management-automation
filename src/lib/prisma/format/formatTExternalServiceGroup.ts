import type {
  TExternalServiceGroup,
  TExternalServiceGroupId,
  TNamespaceId,
} from "@/types/prisma";
import type {
  ExternalServiceAccount,
  ExternalServiceGroup,
} from "@prisma/client";

export const formatTExternalServiceGroup = (
  input: ExternalServiceGroup & { account: ExternalServiceAccount },
): TExternalServiceGroup => {
  return {
    id: input.id as TExternalServiceGroupId,
    name: input.name,
    service: input.account.service,
    groupId: input.groupId,
    namespaceId: input.namespaceId as TNamespaceId,
  };
};
