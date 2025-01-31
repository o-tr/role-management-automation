import type { GetNamespaceInvitationsResponse } from "@/app/api/ns/[nsId]/invitations/route";
import type { TNamespaceId } from "@/types/prisma";
import useSWR from "swr";
import { useOnInvitationsChange } from "./onInvitationsChange";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export const useInvitations = (nsId: TNamespaceId) => {
  const { data, error, mutate } = useSWR<GetNamespaceInvitationsResponse>(
    `/api/ns/${nsId}/invitations/`,
    fetcher,
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );

  useOnInvitationsChange(mutate);

  return {
    invitations:
      data && data.status === "success" ? data.invitations : undefined,
    responseError: data && data.status === "error" ? data : undefined,
    error,
    isPending: !error && !data,
    refetch: mutate,
  };
};
