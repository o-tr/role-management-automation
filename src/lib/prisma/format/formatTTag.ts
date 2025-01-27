import type { TNamespaceId, TTag, TTagId } from "@/types/prisma";
import type { Tag } from "@prisma/client";

export const formatTTag = (input: Tag): TTag => {
  return {
    id: input.id as TTagId,
    name: input.name,
    namespaceId: input.namespaceId as TNamespaceId,
  };
};
