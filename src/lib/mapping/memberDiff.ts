import type { ExternalServiceName } from "@prisma/client";
import type { TExternalServiceGroupMembers } from "@/app/api/ns/[nsId]/services/accounts/[accountId]/groups/[groupId]/members/route";
import { getGroupInvitesSent } from "@/lib/vrchat/requests/getGroupInvitesSent";
import { ZVRCGroupId } from "@/lib/vrchat/types/brand";
import type { TMappingAction } from "@/types/actions";
import type { TMappingCondition } from "@/types/conditions";
import type { TDiffItem, TMemberWithDiff } from "@/types/diff";
import type {
  TExternalServiceAccount,
  TExternalServiceAccountId,
  TExternalServiceGroupId,
  TExternalServiceGroupWithAccount,
  TMapping,
  TMemberWithRelation,
  TTag,
  TTagId,
} from "@/types/prisma";

export type TargetGroup = {
  serviceAccountId: TExternalServiceAccountId;
  serviceGroupId: TExternalServiceGroupId;
  service: ExternalServiceName;
};

export const getInvitedUsers = async (
  serviceAccount: TExternalServiceAccount,
  groupId: string,
): Promise<Set<string>> => {
  const invitedUsers = new Set<string>();

  try {
    const vrchatGroupId = ZVRCGroupId.parse(groupId);
    let offset = 0;
    let hasMore = true;

    while (hasMore) {
      const invites = await getGroupInvitesSent(serviceAccount, vrchatGroupId, {
        limit: 100,
        offset,
      });

      if (invites.length === 0) {
        hasMore = false;
      } else {
        for (const invite of invites) {
          invitedUsers.add(invite.userId);
        }
        offset += invites.length;
        // 100未満の場合は最後のページなので終了
        if (invites.length < 100) {
          hasMore = false;
        }
      }
    }
  } catch (error) {
    // エラーが発生した場合は空のSetを返す（招待チェックをスキップ）
    console.warn(`Failed to get invited users for group ${groupId}:`, error);
  }

  return invitedUsers;
};

export const calculateDiff = async (
  members: TMemberWithRelation[],
  mappings: TMapping[],
  groupMembers: TExternalServiceGroupMembers[],
  groups: TExternalServiceGroupWithAccount[],
  invitedUsersMap?: Map<string, Set<string>>,
): Promise<TMemberWithDiff[]> => {
  const results: TMemberWithDiff[] = [];

  for (const member of members) {
    const tags = member.tags;
    const actions = evaluateMappings(tags, mappings);
    const filteredGroupMembers = extractGroupMembers(member, groupMembers);

    const diffItems: TDiffItem[] = [];

    for (const action of actions) {
      const group = groups.find(
        (group) =>
          group.account.id === action.targetServiceAccountId &&
          group.id === action.targetServiceGroupId,
      );
      if (!group?.service) {
        continue;
      }

      const groupMember = filteredGroupMembers.find(
        (groupMember) =>
          groupMember.group.serviceAccountId === group.account.id &&
          groupMember.group.serviceGroupId === group.id,
      );

      if (!groupMember && action.type !== "invite-group") {
        continue;
      }

      if (action.type === "add") {
        if (!groupMember) {
          continue;
        }
        if (
          groupMember.groupMember.roleIds.includes(action.targetServiceRoleId)
        ) {
          continue;
        }
        diffItems.push({
          type: "add",
          serviceGroup: group,
          groupMember: groupMember.groupMember,
          roleId: action.targetServiceRoleId,
          ignore: !groupMember.groupMember.isEditable,
        });
      } else if (action.type === "remove") {
        if (!groupMember) {
          continue;
        }
        if (
          !groupMember.groupMember.roleIds.includes(action.targetServiceRoleId)
        ) {
          continue;
        }
        diffItems.push({
          type: "remove",
          serviceGroup: group,
          groupMember: groupMember.groupMember,
          roleId: action.targetServiceRoleId,
          ignore: !groupMember.groupMember.isEditable,
        });
      } else if (action.type === "invite-group") {
        if (group.service !== "VRCHAT") {
          continue;
        }
        if (groupMember) {
          continue;
        }

        const targetAccount = member.externalAccounts.find(
          (externalAccount) => externalAccount.service === group.service,
        );
        if (!targetAccount) {
          continue;
        }

        // 招待送信済みユーザーをチェック（招待データが提供されている場合のみ）
        let isAlreadyInvited = false;
        if (invitedUsersMap) {
          const inviteKey = `${group.account.id}-${group.groupId}`;
          const invitedUsers = invitedUsersMap.get(inviteKey);
          isAlreadyInvited =
            invitedUsers?.has(targetAccount.serviceId) ?? false;
        }

        diffItems.push({
          type: "invite-group",
          serviceGroup: group,
          targetAccount,
          ignore: isAlreadyInvited,
        });
      }
    }

    if (diffItems.length > 0) {
      results.push({
        member,
        diff: diffItems,
      });
    }
  }

  return results;
};

const extractGroupMembers = (
  member: TMemberWithRelation,
  groupMembers: TExternalServiceGroupMembers[],
) => {
  return groupMembers
    .flatMap((group) => {
      const account = member.externalAccounts.find(
        (account) => account.service === group.service,
      );
      if (!account) {
        return [];
      }
      const groupMember = group.members.find(
        (m) => m.serviceId === account.serviceId,
      );
      if (!groupMember) {
        return [];
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
    const tagIds = new Set(tags.map((tag) => tag.id));

    switch (condition.key) {
      case "some-tag":
        switch (condition.comparator) {
          case "equals":
            return tagIds.has(condition.value as TTagId);
          case "notEquals":
            return !tagIds.has(condition.value as TTagId);
          case "contains-any":
            if (Array.isArray(condition.value)) {
              // 空配列の場合は false を返す
              if (condition.value.length === 0) {
                return false;
              }
              return condition.value.some((v) => tagIds.has(v as TTagId));
            }
            return tagIds.has(condition.value as TTagId);
          case "contains-all":
            if (Array.isArray(condition.value)) {
              // 空配列の場合は false を返す
              if (condition.value.length === 0) {
                return false;
              }
              return condition.value.every((v) => tagIds.has(v as TTagId));
            }
            return tagIds.has(condition.value as TTagId);
          default:
            throw new Error(`Unknown comparator: ${condition.comparator}`);
        }
      default:
        throw new Error(`Unknown key: ${condition.key}`);
    }
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
