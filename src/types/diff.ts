import { z } from "zod";
import { ZMappingActionType } from "./actions";
import {
  ZExternalServiceGroupMember,
  ZExternalServiceGroupWithAccount,
  ZMemberWithRelation,
} from "./prisma";

export const ZDiffItem = z.object({
  type: ZMappingActionType,
  serviceGroup: ZExternalServiceGroupWithAccount,
  groupMember: ZExternalServiceGroupMember,
  roleId: z.string(),
  ignore: z.boolean(),
});
export type TDiffItem = z.infer<typeof ZDiffItem>;

// 進捗表示時に使用される拡張されたDiffItem型
export const ZExtendedDiffItem = ZDiffItem.extend({
  status: z.enum(["success", "error", "skipped"]).optional(),
  reason: z.string().optional(),
});
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
