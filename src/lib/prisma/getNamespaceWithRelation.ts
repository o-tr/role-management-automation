import type { TNamespaceId, TNamespaceWithRelation } from "@/types/prisma";
import { prisma } from "../prisma";
import { formatTNamespaceWithRelation } from "./format/formatTNamespaceWithRelation";

export const getNamespaceWithRelation = async (
  nsId: TNamespaceId,
): Promise<TNamespaceWithRelation | null> => {
  const result = await prisma.namespace.findUnique({
    where: {
      id: nsId,
    },
    include: {
      owner: true,
      admins: true,
      members: true,
      tags: true,
    },
  });
  if (!result) {
    return null;
  }
  return formatTNamespaceWithRelation(result);
};
