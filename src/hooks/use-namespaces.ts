"use client";
import type { GetNamespacesResponse } from "@/app/api/ns/route";
import type { TNamespace } from "@/types/prisma";
import { useCallback, useEffect, useState } from "react";

export const useNamespaces = () => {
  const [namespaces, setNamespaces] = useState<TNamespace[] | undefined>();
  const [isPending, setIsPending] = useState(true);

  const fetchData = useCallback(async () => {
    const response = (await fetch("/api/ns").then((res) =>
      res.json(),
    )) as GetNamespacesResponse;
    if (response.status === "error") {
      throw new Error(response.error);
    }
    setNamespaces(response.namespaces);
    setIsPending(false);
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  return { namespaces, isPending, refetch: fetchData };
};
