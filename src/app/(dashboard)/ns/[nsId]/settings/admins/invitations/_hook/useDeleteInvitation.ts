import { useState } from "react";
import type { DeleteNamespaceInvitationResponse } from "@/app/api/ns/[nsId]/invitations/[invitationId]/route";
import type { TNamespaceId, TNamespaceInvitationId } from "@/types/prisma";
import { onInvitationsChange } from "./onInvitationsChange";

export const useDeleteInvitation = (nsId: TNamespaceId) => {
  const [loading, setLoading] = useState(false);

  const deleteNamespaceInvitation = async (
    invitationId: TNamespaceInvitationId,
  ): Promise<DeleteNamespaceInvitationResponse> => {
    setLoading(true);
    const response = await fetch(
      `/api/ns/${nsId}/invitations/${invitationId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      },
    ).then((res) => res.json());
    setLoading(false);
    onInvitationsChange();
    return response;
  };

  return {
    loading,
    deleteNamespaceInvitation,
  };
};
