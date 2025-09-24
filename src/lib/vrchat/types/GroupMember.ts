import { z } from "zod";
import {
  ZVRCGroupId,
  ZVRCGroupMemberId,
  ZVRCGroupRoleId,
  ZVRCUserId,
} from "./brand";

export const ZVRCGroupMemberLimitedUser = z.object({
  id: ZVRCUserId,
  displayName: z.string(),
  thumbnailUrl: z.string().optional().nullable(),
  iconUrl: z.string(),
  currentAvatarThumbnailImageUrl: z.string().optional().nullable(),
});
export type VRCGroupMemberLimitedUser = z.infer<
  typeof ZVRCGroupMemberLimitedUser
>;

export const ZVRCGroupMember = z.object({
  id: ZVRCGroupMemberId,
  groupId: ZVRCGroupId,
  userId: ZVRCUserId,
  user: ZVRCGroupMemberLimitedUser,
  roleIds: z.array(ZVRCGroupRoleId).optional(),
});
export type VRCGroupMember = z.infer<typeof ZVRCGroupMember>;
