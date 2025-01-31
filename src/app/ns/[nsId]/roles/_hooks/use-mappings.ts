"use client";
import type { GetSerializedMappingsResponse } from "@/app/api/ns/[nsId]/mappings/route";
import { convertTSerializedMappingToTMapping } from "@/lib/prisma/convert/convertTSerializedMappingToTMapping";
import type { TMapping } from "@/types/prisma";
import { useMemo } from "react";
import useSWR from "swr";
import { useOnServiceGroupMappingChange } from "./on-mappings-change";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export const useMappings = (nsId: string) => {
  const { data, error, isLoading, mutate } =
    useSWR<GetSerializedMappingsResponse>(`/api/ns/${nsId}/mappings`, fetcher, {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    });
  const mappings = useMemo(() => {
    if (data?.status !== "success") return undefined;
    return data.mappings.map<TMapping>(convertTSerializedMappingToTMapping);
  }, [data]);

  useOnServiceGroupMappingChange(mutate);

  return {
    mappings,
    responseError: data?.status === "error" ? data : undefined,
    isPending: isLoading,
    error,
    refetch: mutate,
  };
};
