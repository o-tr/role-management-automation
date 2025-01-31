import type { GetExternalServiceAccountsResponse } from "@/app/api/ns/[nsId]/services/accounts/route";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export const useServiceAccounts = (nsId: string) => {
  const { data, error, mutate } = useSWR<GetExternalServiceAccountsResponse>(
    `/api/ns/${nsId}/services/accounts/`,
    fetcher,
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );

  return {
    accounts: data?.status === "success" ? data.serviceAccounts : undefined,
    responseError: data?.status === "error" ? data : undefined,
    isPending: !error && !data,
    refetch: mutate,
  };
};
