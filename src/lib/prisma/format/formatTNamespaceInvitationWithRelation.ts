import type { Namespace, NamespaceInvitation } from "@prisma/client";
import type { TNamespaceInvitationWithRelation } from "@/types/prisma";
import { formatTNamespace } from "./formatTNamespace";
import { formatTNamespaceInvitation } from "./formatTNamespaceInvitation";

export const formatTNamespaceInvitationWithRelation = (
  invitation: NamespaceInvitation & {
    namespace: Namespace;
  },
): TNamespaceInvitationWithRelation => {
  return {
    ...formatTNamespaceInvitation(invitation),
    namespace: formatTNamespace(invitation.namespace),
  };
};
