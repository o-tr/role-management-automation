import type {
  TNamespaceId,
  TNamespaceInvitation,
  TNamespaceInvitationId,
} from "@/types/prisma";
import type { NamespaceInvitation } from "@prisma/client";

export const formatTNamespaceInvitation = (
  invitation: NamespaceInvitation,
): TNamespaceInvitation => {
  return {
    id: invitation.id as TNamespaceInvitationId,
    namespaceId: invitation.namespaceId as TNamespaceId,
    token: invitation.token,
    expires: invitation.expires,
  };
};
