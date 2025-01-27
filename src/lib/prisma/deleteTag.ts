import type { TNamespaceId, TTagId } from "@/types/prisma";
import { prisma } from "../prisma";

export const deleteTag = async (
  nsId: TNamespaceId,
  tagId: TTagId,
): Promise<void> => {
  await prisma.tag.delete({
    where: {
      namespaceId: nsId,
      id: tagId,
    },
  });
};
