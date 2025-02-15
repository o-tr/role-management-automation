import type { AddMembersResponse } from "@/app/api/ns/[nsId]/members/route";
import type { TCreateOrUpdateMembers } from "@/lib/prisma/createOrUpdateMember";
import { useState } from "react";

export const useCreateMembers = (nsId: string) => {
  const [loading, setLoading] = useState(false);

  const createMembers = async (
    body: TCreateOrUpdateMembers,
  ): Promise<AddMembersResponse> => {
    setLoading(true);
    const response = await fetch(`/api/ns/${nsId}/members`, {
      method: "POST",
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
    createMembers,
  };
};
