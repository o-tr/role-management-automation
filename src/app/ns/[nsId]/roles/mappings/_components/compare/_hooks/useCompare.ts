import { useMembers } from "@/app/ns/[nsId]/members/_hooks/use-tags";
import type { TMappingAction } from "@/types/actions";
import type { TMappingCondition } from "@/types/conditions";
import type { TMapping, TMemberWithRelation, TTag } from "@/types/prisma";
import { useMemo } from "react";
import { useMappings } from "../../../../_hooks/use-mappings";
import {
  type TargetGroup,
  type TargetGroupMembers,
  useGroupMembers,
} from "./useGroupMembers";

export const useCompare = (nsId: string) => {
  const { members, isPending: isMembersPending } = useMembers(nsId);
  const { mappings, isPending: isMappingsPending } = useMappings(nsId);
  const targetGroups = useMemo(() => extractTargetGroups(mappings), [mappings]);
  const { groupMembers, isPending: isGroupMembersPending } = useGroupMembers(
    nsId,
    targetGroups,
  );

  const result = useMemo(() => {
    if (
      isMembersPending ||
      isMappingsPending ||
      isGroupMembersPending ||
      !members ||
      !mappings ||
      !groupMembers
    ) {
      return {
        isPending: true,
        result: [],
      };
    }

    const result = members.map((member) => {
      const tags = member.tags;
      const actions = evaluateMappings(tags, mappings);
      const groupMember = extractGroupMembers(member, groupMembers);
      const result = actions.map((action) => {
        const targetGroup = targetGroups.find(
          (group) =>
            group.serviceAccountId === action.targetServiceAccountId &&
            group.serviceGroupId === action.targetServiceGroupId,
        );
        if (!targetGroup) {
          return undefined;
        }
        const group = groupMembers.find(
          (groupMember) =>
            groupMember.serviceAccountId === targetGroup.serviceAccountId &&
            groupMember.serviceGroupId === targetGroup.serviceGroupId,
        );
        if (!group) {
          return undefined;
        }
        const groupMemberDetail = group.members.find((groupMember) =>
          member.externalAccounts.some(
            (account) => account.serviceId === groupMember.serviceId,
          ),
        );
        if (!groupMemberDetail) {
          return undefined;
        }
        return {
          member,
          groupMember: groupMemberDetail,
        };
      });

      return {
        member,
        groupMembers,
      };
    });

    return {
      isPending: false,
      result,
    };
  }, [
    members,
    mappings,
    groupMembers,
    targetGroups,
    isMappingsPending,
    isMembersPending,
    isGroupMembersPending,
  ]);
};

const extractGroupMembers = (
  member: TMemberWithRelation,
  groupMembers: TargetGroupMembers[],
) => {
  return member.externalAccounts
    .map((account) => {
      const group = groupMembers.find(
        (groupMember) =>
          groupMember.serviceAccountId === account.namespaceId &&
          groupMember.serviceGroupId === account.serviceId,
      );
      const groupMember = group?.members.find(
        (member) => member.serviceId === account.id,
      );
      if (!groupMember) {
        return undefined;
      }
      return {
        account,
        groupMember,
      };
    })
    .filter((v) => !!v);
};

const evaluateMappings = (tags: TTag[], mappings: TMapping[]) => {
  const actions: TMappingAction[] = [];
  for (const mapping of mappings) {
    const conditions = mapping.conditions;
    if (evaluateConditions(tags, conditions)) {
      actions.push(...mapping.actions);
    }
  }
  return actions;
};

const evaluateConditions = (
  tags: TTag[],
  condition: TMappingCondition,
): boolean => {
  if (condition.type === "comparator") {
    if (condition.key === "some-tag") {
      return tags.some((tag) => tag.id === condition.value);
    }
    throw new Error("Unknown key");
  }
  if (condition.type === "not") {
    return !evaluateConditions(tags, condition.condition);
  }
  if (condition.type === "and") {
    return condition.conditions.every((c) => evaluateConditions(tags, c));
  }
  if (condition.type === "or") {
    return condition.conditions.some((c) => evaluateConditions(tags, c));
  }
  throw new Error("Unknown condition type");
};

const extractTargetGroups = (mappings?: TMapping[]) => {
  if (!mappings) {
    return [];
  }
  const targets: TargetGroup[] = [];

  for (const mapping of mappings) {
    for (const action of mapping.actions) {
      if (
        targets.some(
          (target) =>
            target.serviceAccountId === action.targetServiceAccountId &&
            target.serviceGroupId === action.targetServiceGroupId,
        )
      ) {
        continue;
      }
      targets.push({
        serviceAccountId: action.targetServiceAccountId,
        serviceGroupId: action.targetServiceGroupId,
      });
    }
  }
  return targets;
};
