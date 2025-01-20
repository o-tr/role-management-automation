import type {
  UpdateExternalServiceGroupMappingResponse,
  UpdateMappingBody,
} from "@/app/api/ns/[nsId]/mappings/[mappingId]/route";
import { useCallback, useState } from "react";

export const useUpdateServiceMapping = (nsId: string, mappingId: string) => {
  const [loading, setLoading] = useState(false);

  const updateServiceMapping = useCallback(
    async (
      body: UpdateMappingBody,
    ): Promise<UpdateExternalServiceGroupMappingResponse> => {
      setLoading(true);
      const response = await fetch(`/api/ns/${nsId}/mappings/${mappingId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }).then((res) => res.json());
      setLoading(false);
      return response;
    },
    [nsId, mappingId],
  );

  return {
    loading,
    updateServiceMapping,
  };
};
