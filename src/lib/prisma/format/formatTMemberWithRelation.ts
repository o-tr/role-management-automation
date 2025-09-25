import type { Member, MemberExternalServiceAccount, Tag } from "@prisma/client";
import type {
  TMemberId,
  TMemberWithRelation,
  TNamespaceId,
} from "@/types/prisma";
import { formatTMemberExternalServiceAccount } from "./formatTMemberExternalServiceAccount";
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
    externalAccounts: member.externalAccounts.map(
      formatTMemberExternalServiceAccount,
    ),
    namespaceId: member.namespaceId as TNamespaceId,
  };
};
