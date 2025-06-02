import type {
  TMemberExternalServiceAccount,
  TMemberExternalServiceAccountId,
  TMemberId,
  TNamespaceId,
} from "@/types/prisma";
import type {
  ExternalServiceName,
  MemberExternalServiceAccount,
} from "@prisma/client";

export const formatTMemberExternalServiceAccount = (
  input: MemberExternalServiceAccount,
): TMemberExternalServiceAccount => {
  return {
    id: input.id as TMemberExternalServiceAccountId,
    service: input.service as ExternalServiceName,
    serviceId: input.serviceId,
    serviceUsername: input.serviceUsername || undefined,
    name: input.name,
    icon: input.icon || undefined,
    status: input.status,
    memberId: input.memberId as TMemberId,
    namespaceId: input.namespaceId as TNamespaceId,
  };
};
