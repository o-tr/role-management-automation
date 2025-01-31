"use client";
import type { GetNamespaceDetailResponse } from "@/app/api/ns/[nsId]/route";
import type { TNamespaceId } from "@/types/prisma";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

type Props = {
  namespaceId: TNamespaceId;
};

export const useNamespace = ({ namespaceId }: Props) => {
  const { data, isLoading, mutate } = useSWR<GetNamespaceDetailResponse>(
    `/api/ns/${namespaceId}`,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );

  return {
    namespace: data?.status === "success" ? data.namespace : undefined,
    responseError: data?.status === "error" ? data : undefined,
    isPending: isLoading,
    refetch: mutate,
  };
};
