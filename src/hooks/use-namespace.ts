"use client";
import type {
  GetNamespaceDetailResponse,
  NamespaceDetailResponse,
} from "@/app/api/ns/[nsId]/route";
import { useCallback, useEffect, useState } from "react";

type Props = {
  namespaceId: string;
};

export const useNamespace = ({ namespaceId }: Props) => {
  const [namespace, setNamespace] = useState<
    NamespaceDetailResponse | undefined
  >();
  const [isPending, setIsPending] = useState(true);

  const fetchData = useCallback(async () => {
    const response = (await fetch(`/api/ns/${namespaceId}`).then((res) =>
      res.json(),
    )) as GetNamespaceDetailResponse;
    if (response.status === "error") {
      throw new Error(response.error);
    }
    setNamespace(response.namespace);
    setIsPending(false);
  }, [namespaceId]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  return { namespace, isPending, refetch: fetchData };
};
