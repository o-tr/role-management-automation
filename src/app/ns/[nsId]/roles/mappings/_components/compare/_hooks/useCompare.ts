import { useServiceGroups } from "@/app/ns/[nsId]/_hooks/use-service-groups";
import { useMembers } from "@/app/ns/[nsId]/members/_hooks/use-tags";
import type { TMappingAction, TMappingActionType } from "@/types/actions";
import type { TMappingCondition } from "@/types/conditions";
import type {
  TExternalServiceAccount,
  TExternalServiceGroupMember,
  TExternalServiceGroupWithAccount,
  TMapping,
  TMemberExternalServiceAccount,
  TMemberWithRelation,
  TNamespaceId,
  TTag,
} from "@/types/prisma";
import { useMemo } from "react";
import { useMappings } from "../../../../_hooks/use-mappings";
import {
  type TargetGroup,
  type TargetGroupMembers,
  useGroupMembers,
} from "./useGroupMembers";

export type TMemberDiff = {
  type: TMappingActionType;
  serviceAccount: TMemberExternalServiceAccount;
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

    const result = members
      .map((member) => {
        const tags = member.tags;
        const actions = evaluateMappings(tags, mappings);
        const filteredGroupMembers = extractGroupMembers(member, groupMembers);
        const result = actions.map<TMemberDiff | undefined>((action) => {
          const targetServiceType = groups.find(
            (group) =>
              group.account.id === action.targetServiceAccountId &&
              group.id === action.targetServiceGroupId,
          )?.service;
          if (!targetServiceType) {
            return undefined;
          }
          const groupMember = filteredGroupMembers.find(
            (groupMember) => groupMember.account.service === targetServiceType,
          );
          if (!groupMember) {
            return undefined;
          }
          if (action.type === "add") {
            if (
              groupMember.groupMember.roleIds.includes(
                action.targetServiceRoleId,
              )
            ) {
              return undefined;
            }
            return {
              type: "add",
              serviceAccount: groupMember.account,
              groupMember: groupMember.groupMember,
              roleId: action.targetServiceRoleId,
            };
          }
          if (action.type === "remove") {
            if (
              !groupMember.groupMember.roleIds.includes(
                action.targetServiceRoleId,
              )
            ) {
              return undefined;
            }
            return {
              type: "remove",
              serviceAccount: groupMember.account,
              groupMember: groupMember.groupMember,
              roleId: action.targetServiceRoleId,
            };
          }
        });

        return {
          member,
          diff: result.filter((v) => !!v),
        };
      })
      .filter((v) => v.diff.length > 0);

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

const extractGroupMembers = (
  member: TMemberWithRelation,
  groupMembers: TargetGroupMembers[],
) => {
  return member.externalAccounts
    .map((account) => {
      const group = groupMembers.find(
        (groupMember) => groupMember.service === account.service,
      );
      const groupMember = group?.members.find(
        (member) => member.serviceId === account.serviceId,
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

const extractTargetGroups = (
  groups?: TExternalServiceGroupWithAccount[],
  mappings?: TMapping[],
) => {
  if (!mappings || !groups) {
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
      const service = groups.find(
        (group) => group.account.id === action.targetServiceAccountId,
      );
      if (!service) {
        continue;
      }
      targets.push({
        serviceAccountId: action.targetServiceAccountId,
        serviceGroupId: action.targetServiceGroupId,
        service: service.account.service,
      });
    }
  }
  return targets;
};
