import useSWR from "swr";
import type { GetExternalServiceGroupRolesResponse } from "@/app/api/ns/[nsId]/services/accounts/[accountId]/groups/[groupId]/roles/route";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export const useGroupRoles = (
  nsId: string,
  accountId: string,
  groupId: string,
) => {
  const { data, error, isLoading } =
    useSWR<GetExternalServiceGroupRolesResponse>(
      `/api/ns/${nsId}/services/accounts/${accountId}/groups/${groupId}/roles`,
      fetcher,
      {
        revalidateIfStale: false,
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
      },
    );

  return {
    roles: data && data.status === "success" ? data.serviceRoles : undefined,
    isLoading,
    isError: error,
  };
};
