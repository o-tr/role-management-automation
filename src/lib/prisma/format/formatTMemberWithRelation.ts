import {
  type TMemberExternalServiceAccountId,
  type TMemberId,
  type TMemberWithRelation,
  type TNamespaceId,
  TTagId,
} from "@/types/prisma";
import type { Member, MemberExternalServiceAccount, Tag } from "@prisma/client";
import { formatTTag } from "./formatTTag";

export const formatTMemberWithRelation = (
  member: Member & {
    tags: Tag[];
    externalAccounts: MemberExternalServiceAccount[];
  },
): TMemberWithRelation => {
  return {
    id: member.id as TMemberId,
    tags: member.tags.map(formatTTag),
    externalAccounts: member.externalAccounts.map((externalAccount) => ({
      id: externalAccount.id as TMemberExternalServiceAccountId,
      service: externalAccount.service,
      serviceId: externalAccount.serviceId,
      name: externalAccount.name,
      icon: externalAccount.icon || undefined,
      namespaceId: externalAccount.namespaceId as TNamespaceId,
      memberId: externalAccount.memberId as TMemberId,
    })),
    namespaceId: member.namespaceId as TNamespaceId,
  };
};
