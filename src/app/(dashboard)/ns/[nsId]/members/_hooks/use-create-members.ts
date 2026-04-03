import { useRef, useState } from "react";
import type { AddMembersResponse } from "@/app/api/ns/[nsId]/members/route";
import type { TCreateOrUpdateMembers } from "@/lib/prisma/createOrUpdateMember";

export const useCreateMembers = (nsId: string) => {
  const [loading, setLoading] = useState(false);
  const inFlightRef = useRef(false);

  const createMembers = async (
    body: TCreateOrUpdateMembers,
  ): Promise<AddMembersResponse> => {
    if (inFlightRef.current) {
      throw new Error("メンバー登録処理を実行中です");
    }
    inFlightRef.current = true;
    setLoading(true);
    try {
      const response = (await fetch(`/api/ns/${nsId}/members`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }).then((res) => res.json())) as AddMembersResponse;
      if (response.status === "error") {
        throw new Error(response.error);
      }
      return response;
    } finally {
      inFlightRef.current = false;
      setLoading(false);
    }
  };

  return {
    loading,
    createMembers,
  };
};
