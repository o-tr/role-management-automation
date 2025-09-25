import type {
  ExternalServiceAccount,
  ExternalServiceGroup,
} from "@prisma/client";
import type {
  TExternalServiceGroupId,
  TExternalServiceGroupWithAccount,
  TNamespaceId,
} from "@/types/prisma";
import { formatTExternalServiceAccount } from "./formatTExternalServiceAccount";

export const formatTExternalServiceGroupWithAccount = (
  input: ExternalServiceGroup & { account: ExternalServiceAccount },
): TExternalServiceGroupWithAccount => {
  return {
    id: input.id as TExternalServiceGroupId,
    name: input.name,
    service: input.account.service,
    groupId: input.groupId,
    icon: input.icon || undefined,
    account: formatTExternalServiceAccount(input.account),
    namespaceId: input.namespaceId as TNamespaceId,
  };
};
