"use client";
import useSWR from "swr";
import type { GetNamespacesResponse } from "@/app/api/ns/route";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export const useNamespaces = () => {
  const { data, isLoading, mutate } = useSWR<GetNamespacesResponse>(
    "/api/ns",
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );

  return {
    namespaces: data?.status === "success" ? data.namespaces : undefined,
    responseError: data?.status === "error" ? data : undefined,
    isPending: isLoading,
    refetch: mutate,
  };
};
