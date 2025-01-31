import type { TNamespaceId } from "@/types/prisma";
import { prisma } from "../prisma";
import { formatTNamespaceInvitation } from "./format/formatTNamespaceInvitation";

export const getNamespaceInvitations = async (nsId: TNamespaceId) => {
  const invitations = await prisma.namespaceInvitation.findMany({
    where: {
      namespaceId: nsId,
    },
  });
  return invitations.map(formatTNamespaceInvitation);
};
