import { useCallback, useState } from "react";
import type {
  UpdateExternalServiceGroupMappingResponse,
  UpdateMappingBody,
} from "@/app/api/ns/[nsId]/mappings/[mappingId]/route";

export const useUpdateServiceMapping = (nsId: string, mappingId: string) => {
  const [loading, setLoading] = useState(false);

  const updateServiceMapping = useCallback(
    async (
      body: UpdateMappingBody,
    ): Promise<UpdateExternalServiceGroupMappingResponse> => {
      setLoading(true);
      try {
        const response = (await fetch(`/api/ns/${nsId}/mappings/${mappingId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }).then((res) =>
          res.json(),
        )) as UpdateExternalServiceGroupMappingResponse;
        if (response.status === "error") {
          throw new Error(response.error);
        }
        return response;
      } finally {
        setLoading(false);
      }
    },
    [nsId, mappingId],
  );

  return {
    loading,
    updateServiceMapping,
  };
};
