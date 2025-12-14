import type {
  TNamespaceInvitationId,
  TNamespaceInvitationWithRelation,
} from "@/types/prisma";
import { prisma } from "../prisma";
import { formatTNamespaceInvitationWithRelation } from "./format/formatTNamespaceInvitationWithRelation";

export const getNamespaceInvitationWithRelationByToken = async (
  token: TNamespaceInvitationId,
): Promise<TNamespaceInvitationWithRelation | null> => {
  const invitation = await prisma.namespaceInvitation.findUnique({
    where: {
      token,
      expires: {
        gt: new Date(),
      },
    },
    include: {
      namespace: true,
    },
  });
  if (!invitation) {
    return null;
  }
  return formatTNamespaceInvitationWithRelation(invitation);
};
