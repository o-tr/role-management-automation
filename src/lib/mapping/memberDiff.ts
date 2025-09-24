import type { TExternalServiceGroupMembers } from "@/app/api/ns/[nsId]/services/accounts/[accountId]/groups/[groupId]/members/route";
import type { TMappingAction } from "@/types/actions";
import type { TMappingCondition } from "@/types/conditions";
import type { TDiffItem, TMemberWithDiff } from "@/types/diff";
import type {
  TExternalServiceAccountId,
  TExternalServiceGroupId,
  TExternalServiceGroupWithAccount,
  TMapping,
  TMemberWithRelation,
  TTag,
} from "@/types/prisma";
import type { ExternalServiceName } from "@prisma/client";

export type TargetGroup = {
  serviceAccountId: TExternalServiceAccountId;
  serviceGroupId: TExternalServiceGroupId;
  service: ExternalServiceName;
};

export const calculateDiff = (
  members: TMemberWithRelation[],
  mappings: TMapping[],
  groupMembers: TExternalServiceGroupMembers[],
  groups: TExternalServiceGroupWithAccount[],
): TMemberWithDiff[] => {
  return members
    .map<TMemberWithDiff>((member) => {
      const tags = member.tags;
      const actions = evaluateMappings(tags, mappings);
      const filteredGroupMembers = extractGroupMembers(member, groupMembers);
      const result = actions.map<TDiffItem | undefined>((action) => {
        const group = groups.find(
          (group) =>
            group.account.id === action.targetServiceAccountId &&
            group.id === action.targetServiceGroupId,
        );
        if (!group?.service) {
          return undefined;
        }
        const groupMember = filteredGroupMembers.find(
          (groupMember) =>
            groupMember.group.serviceAccountId === group.account.id &&
            groupMember.group.serviceGroupId === group.id,
        );
        if (!groupMember && action.type !== "invite-group") {
          return undefined;
        }
        if (action.type === "add") {
          if (!groupMember) {
            return undefined;
          }
          if (
            groupMember.groupMember.roleIds.includes(action.targetServiceRoleId)
          ) {
            return undefined;
          }
          return {
            type: "add",
            serviceGroup: group,
            groupMember: groupMember.groupMember,
            roleId: action.targetServiceRoleId,
            ignore: !groupMember.groupMember.isEditable,
          };
        }
        if (action.type === "remove") {
          if (!groupMember) {
            return undefined;
          }
          if (
            !groupMember.groupMember.roleIds.includes(
              action.targetServiceRoleId,
            )
          ) {
            return undefined;
          }
          return {
            type: "remove",
            serviceGroup: group,
            groupMember: groupMember.groupMember,
            roleId: action.targetServiceRoleId,
            ignore: !groupMember.groupMember.isEditable,
          };
        }
        if (action.type === "invite-group") {
          if (group.service !== "VRCHAT") {
            return undefined;
          }
          if (groupMember) {
            return undefined;
          }
          const targetAccount = member.externalAccounts.find(
            (externalAccount) => externalAccount.service === group.service,
          );
          if (!targetAccount) {
            return undefined;
          }
          return {
            type: "invite-group",
            serviceGroup: group,
            targetAccount,
            ignore: false,
          };
        }
      });

      return {
        member,
        diff: result.filter((v) => !!v),
      };
    })
    .filter((v) => v.diff.length > 0);
};

const extractGroupMembers = (
  member: TMemberWithRelation,
  groupMembers: TExternalServiceGroupMembers[],
) => {
  return member.externalAccounts
    .map((account) => {
      const group = groupMembers.find(
        (groupMember) => groupMember.service === account.service,
      );
      const groupMember = group?.members.find(
        (member) => member.serviceId === account.serviceId,
      );
      if (!groupMember || !group) {
        return undefined;
      }
      return {
        account,
        group,
        groupMember,
      };
    })
    .filter((v) => !!v);
};

const evaluateMappings = (tags: TTag[], mappings: TMapping[]) => {
  const actions: TMappingAction[] = [];
  for (const mapping of mappings) {
    if (!mapping.enabled) {
      continue;
    }
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

export const extractTargetGroups = (
  groups?: TExternalServiceGroupWithAccount[],
  mappings?: TMapping[],
) => {
  if (!mappings || !groups) {
    return [];
  }
  const targets: TargetGroup[] = [];

  for (const mapping of mappings) {
    if (!mapping.enabled) {
      continue;
    }
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
