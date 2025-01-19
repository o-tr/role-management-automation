import type { GetExternalServiceGroupsResponse } from "@/app/api/ns/[nsId]/services/groups/route";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export const useServiceGroups = (nsId: string) => {
  const { data, error, mutate } = useSWR<GetExternalServiceGroupsResponse>(
    `/api/ns/${nsId}/services/groups/`,
    fetcher,
  );

  return {
    groups: data && data.status === "success" ? data.serviceGroups : undefined,
    isPending: !error && !data,
    refetch: mutate,
  };
};
