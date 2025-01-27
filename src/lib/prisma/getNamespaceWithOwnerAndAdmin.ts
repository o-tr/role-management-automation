import type {
  TNamespaceId,
  TNamespaceWithOwnerAndAdmins,
  TUserId,
} from "@/types/prisma";
import { prisma } from "../prisma";
import { formatTNamespaceWithOwnerAndAdmins } from "./format/formatTNamespaceWithOwnerAndAdmins";

export const getNamespaceWithOwnerAndAdmins = async (
  nsId: TNamespaceId,
): Promise<TNamespaceWithOwnerAndAdmins | null> => {
  const result = await prisma.namespace.findUnique({
    where: {
      id: nsId,
    },
    include: {
      owner: true,
      admins: true,
    },
  });
  if (!result) {
    return null;
  }
  return formatTNamespaceWithOwnerAndAdmins(result);
};
