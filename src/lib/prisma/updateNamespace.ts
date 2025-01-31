import type {
  TMemberId,
  TNamespaceId,
  TNamespaceWithRelation,
  TTagId,
  TUserId,
} from "@/types/prisma";
import { prisma } from "../prisma";
import { formatTNamespaceWithRelation } from "./format/formatTNamespaceWithRelation";

export type TUpdateNamespaceInput = {
  name?: string;
  ownerId?: TUserId;
};

export const updateNamespace = async (
  nsId: TNamespaceId,
  { name, ownerId }: TUpdateNamespaceInput,
): Promise<TNamespaceWithRelation> => {
  const result = await prisma.namespace.update({
    where: {
      id: nsId,
    },
    data: {
      name,
      ownerId,
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
