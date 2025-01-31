import type { TNamespaceId, TNamespaceInvitationId } from "@/types/prisma";
import { prisma } from "../prisma";

export const deleteNamespaceInvitation = async (
  namespaceId: TNamespaceId,
  invitationId: TNamespaceInvitationId,
): Promise<void> => {
  await prisma.namespaceInvitation.delete({
    where: {
      id: invitationId,
      namespaceId: namespaceId,
    },
  });
};
