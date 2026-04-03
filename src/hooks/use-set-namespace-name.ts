import { useState } from "react";
import type { GetNamespaceDetailResponse } from "@/app/api/ns/[nsId]/route";

export const useSetNamespaceName = (nsId: string) => {
  const [isLoading, setIsLoading] = useState(false);

  const setNamespaceName = async (name: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/ns/${nsId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      });
      if (!response.ok) {
        const text = await response.text().catch(() => "");
        throw new Error(
          text || `Request failed with status ${response.status}`,
        );
      }
      const raw = await response.text().catch(() => "");
      if (!raw) {
        throw new Error("Failed to parse JSON response");
      }
      let body: GetNamespaceDetailResponse;
      try {
        body = JSON.parse(raw) as GetNamespaceDetailResponse;
      } catch (_error) {
        throw new Error("Failed to parse JSON response");
      }
      if (body.status === "error") {
        throw new Error(body.error);
      }
      return body.namespace;
    } finally {
      setIsLoading(false);
    }
  };
  return {
    isLoading,
    setNamespaceName,
  };
};
