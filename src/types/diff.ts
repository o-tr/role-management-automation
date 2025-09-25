import { z } from "zod";
import { ZMappingActionType } from "./actions";
import {
  ZExternalServiceGroupMember,
  ZExternalServiceGroupWithAccount,
  ZMemberExternalServiceAccount,
  ZMemberWithRelation,
} from "./prisma";

const ZDiffStatusFields = {
  status: z.enum(["success", "error", "skipped"]).optional(),
  reason: z.string().optional(),
};

const ZDiffBase = z.object({
  serviceGroup: ZExternalServiceGroupWithAccount,
  ignore: z.boolean(),
});

const ZDiffRoleItem = ZDiffBase.extend({
  type: z.string(),
  groupMember: ZExternalServiceGroupMember,
  roleId: z.string(),
});

const ZDiffRoleAddItem = ZDiffRoleItem.extend({
  type: z.literal("add"),
});

const ZDiffRoleRemoveItem = ZDiffRoleItem.extend({
  type: z.literal("remove"),
});

const ZDiffInviteItem = ZDiffBase.extend({
  type: z.literal("invite-group"),
  targetAccount: ZMemberExternalServiceAccount,
});

export const ZDiffItem = z.discriminatedUnion("type", [
  ZDiffRoleAddItem,
  ZDiffRoleRemoveItem,
  ZDiffInviteItem,
]);
export type TDiffItem = z.infer<typeof ZDiffItem>;

// 進捗表示時に使用される拡張されたDiffItem型
export const ZExtendedDiffItem = z.discriminatedUnion("type", [
  ZDiffRoleAddItem.extend(ZDiffStatusFields),
  ZDiffRoleRemoveItem.extend(ZDiffStatusFields),
  ZDiffInviteItem.extend(ZDiffStatusFields),
]);
export type TExtendedDiffItem = z.infer<typeof ZExtendedDiffItem>;

export const ZMemberWithDiff = z.object({
  member: ZMemberWithRelation,
  diff: z.array(ZDiffItem),
});
export type TMemberWithDiff = z.infer<typeof ZMemberWithDiff>;

// 進捗表示時に使用される拡張されたMemberWithDiff型
export const ZExtendedMemberWithDiff = z.object({
  member: ZMemberWithRelation,
  diff: z.array(ZExtendedDiffItem),
});
export type TExtendedMemberWithDiff = z.infer<typeof ZExtendedMemberWithDiff>;
