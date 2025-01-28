import { useServiceGroups } from "@/app/ns/[nsId]/_hooks/use-service-groups";
import { useMembers } from "@/app/ns/[nsId]/members/_hooks/use-tags";
import { calculateDiff, extractTargetGroups } from "@/lib/memberDiff";
import type { TMappingActionType } from "@/types/actions";
import type {
  TExternalServiceGroupMember,
  TExternalServiceGroupWithAccount,
  TMemberWithRelation,
  TNamespaceId,
} from "@/types/prisma";
import { useMemo } from "react";
import { useMappings } from "../../../../_hooks/use-mappings";
import { useGroupMembers } from "./useGroupMembers";

export type TMemberWithDiff = {
  member: TMemberWithRelation;
  diff: TDiffItem[];
};

export type TDiffItem = {
  type: TMappingActionType;
  serviceGroup: TExternalServiceGroupWithAccount;
  groupMember: TExternalServiceGroupMember;
  roleId: string;
};

export const useCompare = (nsId: TNamespaceId) => {
  const { members, isPending: isMembersPending } = useMembers(nsId);
  const { mappings, isPending: isMappingsPending } = useMappings(nsId);
  const { groups, isPending: isGroupsPending } = useServiceGroups(nsId);
  const targetGroups = useMemo(
    () => extractTargetGroups(groups, mappings),
    [mappings, groups],
  );
  const { groupMembers, isLoading: isGroupMembersPending } = useGroupMembers(
    nsId,
    targetGroups,
  );

  const result = useMemo(() => {
    if (
      isMembersPending ||
      isMappingsPending ||
      isGroupMembersPending ||
      isGroupsPending ||
      !members ||
      !mappings ||
      !groupMembers ||
      !groups
    ) {
      return {
        isPending: true,
        result: [],
      };
    }

    const result = calculateDiff(members, mappings, groupMembers, groups);

    return {
      isPending: false,
      result,
    };
  }, [
    members,
    mappings,
    groupMembers,
    groups,
    isMappingsPending,
    isMembersPending,
    isGroupMembersPending,
    isGroupsPending,
  ]);

  return {
    isPending: result.isPending,
    diff: result.result,
  };
};
