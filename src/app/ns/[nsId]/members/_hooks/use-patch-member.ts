import type { UpdateMemberResponse } from "@/app/api/ns/[nsId]/members/[memberId]/route";
import type { TMemberUpdateInput } from "@/lib/prisma/updateMember";
import { useState } from "react";

export const usePatchMember = (nsId: string) => {
  const [loading, setLoading] = useState(false);

  const patchMembers = async (
    memberId: string,
    body: TMemberUpdateInput,
  ): Promise<UpdateMemberResponse> => {
    setLoading(true);
    const response = await fetch(`/api/ns/${nsId}/members/${memberId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }).then((res) => res.json());
    setLoading(false);
    return response;
  };

  return {
    loading,
    patchMembers,
  };
};
