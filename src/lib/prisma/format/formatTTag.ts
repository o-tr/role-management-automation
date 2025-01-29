import type { TColorCode } from "@/types/brand";
import type { TNamespaceId, TTag, TTagId } from "@/types/prisma";
import type { Tag } from "@prisma/client";

export const formatTTag = (input: Tag): TTag => {
  return {
    id: input.id as TTagId,
    name: input.name,
    color: (input.color as TColorCode) || undefined,
    namespaceId: input.namespaceId as TNamespaceId,
  };
};
