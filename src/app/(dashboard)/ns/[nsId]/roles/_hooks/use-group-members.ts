import useSWR from "swr";
import type { GetExternalServiceGroupMembersResponse } from "@/app/api/ns/[nsId]/services/accounts/[accountId]/groups/[groupId]/members/route";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export const useGroupMembers = (
  nsId: string,
  accountId: string,
  groupId: string,
) => {
  const { data, error } = useSWR<GetExternalServiceGroupMembersResponse>(
    `/api/ns/${nsId}/services/accounts/${accountId}/groups/${groupId}/members`,
    fetcher,
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );

  return {
    members: data && data.status === "success" ? data.data : undefined,
    isLoading: !error && !data,
    isError: error,
  };
};
