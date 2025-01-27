import type { TNamespaceId, TTag } from "@/types/prisma";
import { prisma } from "../prisma";
import { formatTTag } from "./format/formatTTag";

export const getTags = async (nsId: TNamespaceId): Promise<TTag[]> => {
  const result = await prisma.tag.findMany({
    where: {
      namespaceId: nsId,
    },
  });
  return result.map(formatTTag);
};
