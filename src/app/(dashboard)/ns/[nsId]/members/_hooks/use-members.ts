import type { GetMembersResponse } from "@/app/api/ns/[nsId]/members/route";
import useSWR from "swr";
import { useOnMembersChange } from "./on-members-change";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export const useMembers = (nsId: string) => {
  const { data, error, mutate } = useSWR<GetMembersResponse>(
    `/api/ns/${nsId}/members/`,
    fetcher,
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );

  useOnMembersChange(mutate);

  return {
    members: data?.status === "success" ? data.members : undefined,
    responseError: data?.status === "error" ? data : undefined,
    isPending: !error && !data,
    refetch: mutate,
  };
};
