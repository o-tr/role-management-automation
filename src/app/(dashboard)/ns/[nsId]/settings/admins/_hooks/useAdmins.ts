import useSWR from "swr";
import type { GetAdminsResponse } from "@/app/api/ns/[nsId]/admins/route";
import type { TNamespaceId } from "@/types/prisma";
import { useOnAdminsChange } from "./onAdminsChange";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export const useAdmins = (nsId: TNamespaceId) => {
  const { data, error, mutate } = useSWR<GetAdminsResponse>(
    `/api/ns/${nsId}/admins`,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
      shouldRetryOnError: false,
      refreshInterval: 0,
    },
  );

  useOnAdminsChange(mutate);

  return {
    data: data?.status === "success" ? data.admins : undefined,
    responseError: data?.status === "error" ? data : undefined,
    error,
    isLoading: !data && !error,
  };
};
