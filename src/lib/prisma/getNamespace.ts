import type { TNamespace, TNamespaceId } from "@/types/prisma";
import { prisma } from "../prisma";
import { formatTNamespace } from "./format/formatTNamespace";

export const getNamespace = async (
  nsId: TNamespaceId,
): Promise<TNamespace | null> => {
  const result = await prisma.namespace.findUnique({
    where: {
      id: nsId,
    },
    include: {
      owner: true,
    },
  });
  if (!result) {
    return null;
  }
  return formatTNamespace(result);
};
