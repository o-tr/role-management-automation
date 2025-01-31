import type {
  TNamespaceId,
  TNamespaceInvitation,
  TNamespaceInvitationId,
} from "@/types/prisma";
import { prisma } from "../prisma";
import { formatTNamespaceInvitation } from "./format/formatTNamespaceInvitation";

export const getNamespaceInvitation = async (
  nsId: TNamespaceId,
  invitationId: TNamespaceInvitationId,
): Promise<TNamespaceInvitation | null> => {
  const invitation = await prisma.namespaceInvitation.findUnique({
    where: {
      namespaceId: nsId,
      id: invitationId,
      expires: {
        gt: new Date(),
      },
    },
  });
  if (!invitation) {
    return null;
  }
  return formatTNamespaceInvitation(invitation);
};
