import { useState } from "react";
import type { UpdateMemberResponse } from "@/app/api/ns/[nsId]/members/[memberId]/route";
import type { TMemberUpdateInput } from "@/lib/prisma/updateMember";

type UpdateMemberSuccessResponse = Extract<
  UpdateMemberResponse,
  { status: "success" }
>;

export const usePatchMember = (
  nsId: string,
  options?: { trackLoading?: boolean },
) => {
  const [loading, setLoading] = useState(false);
  const trackLoading = options?.trackLoading ?? true;

  const patchMembers = async (
    memberId: string,
    body: TMemberUpdateInput,
  ): Promise<UpdateMemberSuccessResponse> => {
    if (trackLoading) {
      setLoading(true);
    }
    try {
      const response = (await fetch(`/api/ns/${nsId}/members/${memberId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }).then((res) => res.json())) as UpdateMemberResponse;
      if (response.status === "error") {
        throw new Error(response.error);
      }
      return response;
    } finally {
      if (trackLoading) {
        setLoading(false);
      }
    }
  };

  return {
    loading,
    patchMembers,
  };
};
