import type { GetExternalServiceGroupMembersResponse } from "@/app/api/ns/[nsId]/services/accounts/[accountId]/groups/[groupId]/members/route";
import type { TExternalServiceGroupMember } from "@/types/prisma";
import { useLayoutEffect, useState } from "react";

export type TargetGroup = {
  serviceAccountId: string;
  serviceGroupId: string;
};

export type TargetGroupMembers = TargetGroup & {
  members: TExternalServiceGroupMember[];
};

export const useGroupMembers = (nsId: string, groups: TargetGroup[]) => {
  const [isPending, setIsPending] = useState(true);
  const [groupMembers, setGroupMembers] = useState<TargetGroupMembers[]>([]);

  useLayoutEffect(() => {
    const fetchGroupMembers = async () => {
      setIsPending(true);
      const result = (
        await Promise.all(
          groups.map(async (group) => {
            const res = await fetch(
              `/api/ns/${nsId}/services/accounts/${group.serviceAccountId}/groups/${group.serviceGroupId}/members`,
            );
            const data =
              (await res.json()) as GetExternalServiceGroupMembersResponse;
            if (data.status === "error") {
              return undefined;
            }
            return {
              ...group,
              members: data.members,
              service: data.service,
            };
          }),
        )
      ).filter((r) => !!r);
      setGroupMembers(result);
      setIsPending(false);
    };

    void fetchGroupMembers();
  }, [nsId, groups]);
  return {
    groupMembers,
    isPending,
  };
};
