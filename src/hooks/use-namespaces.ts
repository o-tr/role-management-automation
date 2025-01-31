"use client";
import type { NamespaceDetailResponse } from "@/app/api/ns/[nsId]/route";
import type { GetNamespacesResponse } from "@/app/api/ns/route";
import type { TNamespace } from "@/types/prisma";
import { useCallback, useEffect, useState } from "react";
import useSWR from "swr";

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
