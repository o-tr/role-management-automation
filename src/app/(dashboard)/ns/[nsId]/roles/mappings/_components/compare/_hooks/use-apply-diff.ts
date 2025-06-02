import type {
  ApplyMappingRequestResponse,
  TApplyMappingRequestBody,
} from "@/app/api/ns/[nsId]/mappings/apply/route";
import type { TNamespaceId } from "@/types/prisma";
import { useCallback, useState } from "react";

export const useApplyDiff = (nsId: TNamespaceId) => {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<unknown | null>(null);

  const applyDiff = useCallback(
    async (
      diff: TApplyMappingRequestBody,
    ): Promise<ApplyMappingRequestResponse> => {
      setIsPending(true);
      setError(null);
      const res = await fetch(`/api/ns/${nsId}/mappings/apply`, {
        method: "POST",
        body: JSON.stringify(diff),
      });
      const data = (await res.json()) as ApplyMappingRequestResponse;
      setIsPending(false);
      return data;
    },
    [nsId],
  );

  return { applyDiff, isPending, error };
};
