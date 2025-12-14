import { useState } from "react";
import type { PostAcceptInvitationResponse } from "@/app/api/invitations/[token]/accept/route";
import type { TNamespaceInvitationId } from "@/types/prisma";

export const useAcceptInvitation = (invitationId: TNamespaceInvitationId) => {
  const [loading, setLoading] = useState(false);

  const acceptInvitation = async (): Promise<PostAcceptInvitationResponse> => {
    setLoading(true);
    const response = await fetch(`/api/invitations/${invitationId}/accept`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    }).then((res) => res.json());
    setLoading(false);
    return response;
  };

  return {
    loading,
    acceptInvitation,
  };
};
