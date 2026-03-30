import { useState } from "react";
import type { GetNamespaceDetailResponse } from "@/app/api/ns/[nsId]/route";

export const useSetNamespaceName = (nsId: string) => {
  const [isLoading, setIsLoading] = useState(false);

  const setNamespaceName = async (name: string) => {
    setIsLoading(true);
    try {
      const response = (await fetch(`/api/ns/${nsId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      }).then((res) => res.json())) as GetNamespaceDetailResponse;
      if (response.status === "error") {
        throw new Error(response.error);
      }
      return response.namespace;
    } finally {
      setIsLoading(false);
    }
  };
  return {
    isLoading,
    setNamespaceName,
  };
};
