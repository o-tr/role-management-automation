import { useCallback, useState } from "react";
import type { UpdateTagResponse } from "@/app/api/ns/[nsId]/tags/[tagId]/route";
import type { UpdateTagInput } from "@/lib/prisma/updateTag";
import type { TNamespaceId, TTagId } from "@/types/prisma";

export const useUpdateTag = (nsId: TNamespaceId, tagId: TTagId) => {
  const [loading, setLoading] = useState(false);

  const updateTag = useCallback(
    async (body: UpdateTagInput): Promise<UpdateTagResponse> => {
      setLoading(true);
      const response = await fetch(`/api/ns/${nsId}/tags/${tagId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }).then((res) => res.json());
      setLoading(false);
      return response;
    },
    [nsId, tagId],
  );

  return {
    loading,
    updateTag,
  };
};
