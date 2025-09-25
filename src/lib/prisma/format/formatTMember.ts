import type { Member } from "@prisma/client";
import type { TMember, TMemberId, TNamespaceId } from "@/types/prisma";

export const formatTMember = (input: Member): TMember => {
  return {
    id: input.id as TMemberId,
    namespaceId: input.namespaceId as TNamespaceId,
  };
};
