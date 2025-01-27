import type { TNamespaceId, TTag, TTagId } from "@/types/prisma";
import { prisma } from "../prisma";
import { formatTTag } from "./format/formatTTag";

export const getTag = async (
  namespaceId: TNamespaceId,
  tagId: TTagId,
): Promise<TTag | null> => {
  const result = await prisma.tag.findUnique({
    where: {
      id: tagId,
      namespaceId: namespaceId,
    },
  });
  if (!result) {
    return null;
  }
  return formatTTag(result);
};
