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
    try {
      const response = (await fetch(
        `/api/ns/${nsId}/invitations/${invitationId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        },
      ).then((res) => res.json())) as DeleteNamespaceInvitationResponse;
      if (response.status === "error") {
        throw new Error(response.error);
      }
      onInvitationsChange();
      return response;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    deleteNamespaceInvitation,
  };
};
