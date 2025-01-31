import type { GetNamespaceInvitationResponse } from "@/app/api/invitations/[token]/route";
import type { TNamespaceInvitationId } from "@/types/prisma";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export const useInvitation = (invitationId: TNamespaceInvitationId) => {
  const { data, error, mutate } = useSWR<GetNamespaceInvitationResponse>(
    `/api/invitations/${invitationId}`,
    fetcher,
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );

  return {
    invitation:
      data && data.status === "success"
        ? {
            ...data.invitation,
            expires: new Date(data.invitation.expires),
          }
        : undefined,
    error: error ? error.message : undefined,
    responseError: data && data.status === "error" ? data : undefined,
    isPending: !error && !data,
    refetch: mutate,
  };
};
