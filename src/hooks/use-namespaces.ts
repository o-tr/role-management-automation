"use client";
import { GetNamespacesResponse } from "@/app/api/ns/route";
import { TNamespace } from "@/types/prisma";
import { useEffect, useState } from "react";

export const useNamespaces = () => {
  const [namespaces, setNamespaces] = useState<TNamespace[] | undefined>();
  const [isPending, setIsPending] = useState(true);

  const fetchData = async () => {
    const response = (await fetch("/api/ns").then((res) =>
      res.json()
    )) as GetNamespacesResponse;
    if (response.status === "error") {
      throw new Error(response.error);
    }
    setNamespaces(response.namespaces);
    setIsPending(false);
  };

  useEffect(() => {
    void fetchData();
  }, []);

  return { namespaces, isPending, refetch: fetchData };
};
