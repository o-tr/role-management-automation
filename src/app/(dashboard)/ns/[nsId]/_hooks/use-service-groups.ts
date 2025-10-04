import useSWR from "swr";
import type { GetExternalServiceGroupsResponse } from "@/app/api/ns/[nsId]/services/groups/route";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export const useServiceGroups = (nsId: string) => {
  const { data, error, mutate } = useSWR<GetExternalServiceGroupsResponse>(
    `/api/ns/${nsId}/services/groups/`,
    fetcher,
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );

  return {
    groups: data?.status === "success" ? data.serviceGroups : undefined,
    responseError: data?.status === "error" ? data : undefined,
    isPending: !error && !data,
    refetch: mutate,
  };
};
