import type { GetExternalServiceGroupMembersResponse } from "@/app/api/ns/[nsId]/services/accounts/[accountId]/groups/[groupId]/members/route";
import type { TExternalServiceGroupMember } from "@/types/prisma";
import type { ExternalServiceName } from "@prisma/client";
import { useLayoutEffect, useMemo, useState } from "react";
import useSWR from "swr";

export type TargetGroup = {
  serviceAccountId: string;
  serviceGroupId: string;
  service: ExternalServiceName;
};

export type TargetGroupMembers = TargetGroup & {
  members: TExternalServiceGroupMember[];
};

const fetcher = (url: string) =>
  Promise.all(url.split(",").map((u) => fetch(u).then((res) => res.json())));

export const useGroupMembers = (nsId: string, groups: TargetGroup[]) => {
  const { data, error, isLoading } = useSWR<
    GetExternalServiceGroupMembersResponse[]
  >(
    groups
      .map(
        (group) =>
          `/api/ns/${nsId}/services/accounts/${group.serviceAccountId}/groups/${group.serviceGroupId}/members`,
      )
      .join(","),
    fetcher,
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );

  const groupMembers = useMemo(() => {
    if (!data) return undefined;
    if (data.some((v) => v.status === "error")) return undefined;
    return data
      .filter((v) => v.status === "success")
      .map((d, i) => ({
        ...groups[i],
        members: d.members,
        service: d.service,
      }));
  }, [data, groups]);

  return {
    groupMembers,
    isLoading,
    error,
  };
};
