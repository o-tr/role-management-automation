import type {
  TMemberId,
  TNamespaceId,
  TNamespaceWithRelation,
  TTagId,
} from "@/types/prisma";
import { prisma } from "../prisma";
import { formatTNamespaceWithRelation } from "./format/formatTNamespaceWithRelation";

export const updateNamespace = async (
  nsId: TNamespaceId,
  name: string,
): Promise<TNamespaceWithRelation> => {
  const result = await prisma.namespace.update({
    where: {
      id: nsId,
    },
    data: {
      name: name,
    },
    include: {
      owner: true,
      admins: true,
      members: true,
      tags: true,
    },
  });
  return formatTNamespaceWithRelation(result);
};
