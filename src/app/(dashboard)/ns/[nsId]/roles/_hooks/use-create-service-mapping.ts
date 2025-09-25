import { useState } from "react";
import type {
  CreateMappingBody,
  CreateMappingResponse,
} from "@/app/api/ns/[nsId]/mappings/route";

export const useCreateServiceMapping = (nsId: string) => {
  const [loading, setLoading] = useState(false);

  const createServiceMapping = async (
    body: CreateMappingBody,
  ): Promise<CreateMappingResponse> => {
    setLoading(true);
    const response = await fetch(`/api/ns/${nsId}/mappings`, {
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
    createServiceMapping,
  };
};
