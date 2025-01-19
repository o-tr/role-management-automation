"use client";
import type { GeTSerializedMappingsResponse } from "@/app/api/ns/[nsId]/mappings/route";
import type { TMapping } from "@/types/prisma";
import { useCallback, useEffect, useState } from "react";

export const useMappings = (nsId: string) => {
  const [mappings, seTSerializedMappings] = useState<TMapping[]>();
  const [isPending, setIsPending] = useState(true);
  const [error, setError] = useState<string>();

  const fetchData = useCallback(async () => {
    setIsPending(true);
    setError(undefined);
    const res = await fetch(`/api/ns/${nsId}/mappings`);
    const data = (await res.json()) as GeTSerializedMappingsResponse;
    if (data.status === "error") {
      setError(data.error);
      setIsPending(false);
      return;
    }
    seTSerializedMappings(
      data.mappings.map<TMapping>((mapping) => ({
        ...mapping,
        conditions: JSON.parse(mapping.conditions),
        actions: JSON.parse(mapping.actions),
      })),
    );
    setIsPending(false);
  }, [nsId]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  return { mappings, isPending, error, refetch: fetchData };
};
