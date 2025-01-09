"use client";
import { GetNamespaceDetailResponse } from "@/app/api/ns/[nsId]/route";
import { TNamespaceDetail } from "@/types/prisma";
import { useEffect, useState } from "react";

type Props = {
  namespaceId: string;
};

export const useNamespace = ({ namespaceId }: Props) => {
  const [namespace, setNamespace] = useState<TNamespaceDetail | undefined>();
  const [isPending, setIsPending] = useState(true);

  const fetchData = async () => {
    const response = (await fetch(`/api/ns/${namespaceId}`).then((res) =>
      res.json()
    )) as GetNamespaceDetailResponse;
    if (response.status === "error") {
      throw new Error(response.error);
    }
    setNamespace(response.namespace);
    setIsPending(false);
  };

  useEffect(() => {
    void fetchData();
  }, [namespaceId]);

  return { namespace, isPending, refetch: fetchData };
};
