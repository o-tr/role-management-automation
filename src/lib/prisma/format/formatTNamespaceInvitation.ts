import type { NamespaceInvitation } from "@prisma/client";
import type {
  TNamespaceId,
  TNamespaceInvitation,
  TNamespaceInvitationId,
} from "@/types/prisma";

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
