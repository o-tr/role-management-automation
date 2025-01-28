import { getExternalServiceAccountByServiceName } from "@/lib/prisma/getExternalServiceAccountByServiceName";
import { addRoleToGroupMember } from "@/lib/vrchat/requests/addRoleToGroupMember";
import { removeRoleFromGroupMember } from "@/lib/vrchat/requests/removeRoleFromGroupMember";
import {
  ZVRCGroupId,
  ZVRCGroupRoleId,
  ZVRCUserId,
} from "@/lib/vrchat/types/brand";
import type { TDiffItem, TMemberWithDiff } from "@/types/diff";
import type { TNamespaceId } from "@/types/prisma";

export type ApplyDiffResultItem = TDiffItem & {
  success: boolean;
};

export type ApplyDiffResult = TMemberWithDiff & {
  diff: ApplyDiffResultItem[];
};

export const applyDiff = async (
  nsId: TNamespaceId,
  members: TMemberWithDiff[],
): Promise<ApplyDiffResult[]> => {
  return await Promise.all(
    members.map(async ({ member, diff }) => {
      return {
        member,
        diff: await Promise.all(
          diff.map(async (diff) => {
            switch (diff.serviceGroup.service) {
              case "VRCHAT":
                return await applyVRChatDiff(nsId, diff);
              default:
                throw new Error("Unsupported service");
            }
          }),
        ),
      };
    }),
  );
};

const applyVRChatDiff = async (
  nsId: TNamespaceId,
  diff: TDiffItem,
): Promise<ApplyDiffResultItem> => {
  const serviceAccount = await getExternalServiceAccountByServiceName(
    nsId,
    diff.serviceGroup.service,
  );
  if (!serviceAccount) {
    return {
      ...diff,
      success: false,
    };
  }
  try {
    const groupId = ZVRCGroupId.parse(diff.serviceGroup.groupId);
    const userId = ZVRCUserId.parse(diff.groupMember.serviceId);
    const roleId = ZVRCGroupRoleId.parse(diff.roleId);
    if (diff.type === "add") {
      await addRoleToGroupMember(serviceAccount, groupId, userId, roleId);
    } else if (diff.type === "remove") {
      await removeRoleFromGroupMember(serviceAccount, groupId, userId, roleId);
    }
    return {
      ...diff,
      success: true,
    };
  } catch (e) {
    return {
      ...diff,
      success: false,
    };
  }
};
