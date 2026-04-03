import { useState } from "react";
import type {
  CreateNamespaceInvitationResponse,
  TCreateNamespaceInvitationRequestBody,
} from "@/app/api/ns/[nsId]/invitations/route";
import type { TNamespaceId } from "@/types/prisma";
import { onInvitationsChange } from "./onInvitationsChange";

export const useCreateInvitation = (nsId: TNamespaceId) => {
  const [loading, setLoading] = useState(false);

  const createInvitation = async (
    args: TCreateNamespaceInvitationRequestBody,
  ): Promise<CreateNamespaceInvitationResponse> => {
    setLoading(true);
    try {
      const response = (await fetch(`/api/ns/${nsId}/invitations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(args),
      }).then((res) => res.json())) as CreateNamespaceInvitationResponse;
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
    createInvitation,
  };
};
