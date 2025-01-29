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

export const ZMemberWithDiff = z.object({
  member: ZMemberWithRelation,
  diff: z.array(ZDiffItem),
});
export type TMemberWithDiff = z.infer<typeof ZMemberWithDiff>;
