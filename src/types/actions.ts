import { z } from "zod";
import {
  type TExternalServiceAccountId,
  type TExternalServiceGroupId,
  type TServiceRoleId,
  ZExternalServiceAccountId,
  ZExternalServiceGroupId,
  ZServiceRoleId,
} from "./prisma";

export const ZMappingActionId = z
  .string()
  .uuid()
  .brand<"MappingActionId">("MappingActionId");
export type TMappingActionId = z.infer<typeof ZMappingActionId>;

export const ZMappingActionType = z.union([
  z.literal("add"),
  z.literal("remove"),
  z.literal("invite-group"),
]);
export type TMappingActionType = z.infer<typeof ZMappingActionType>;
export const ZMappingActions = ["add", "remove", "invite-group"] as const;

const ZMappingActionBase = z.object({
  id: ZMappingActionId,
  targetServiceAccountId: ZExternalServiceAccountId.refine(
    (value) => value !== "",
    { message: "サービスアカウントを選択してください" },
  ),
  targetServiceGroupId: ZExternalServiceGroupId.refine(
    (value) => value !== "",
    { message: "サービスグループを選択してください" },
  ),
});

const ZAddMappingAction = ZMappingActionBase.extend({
  type: z.literal("add"),
  targetServiceRoleId: ZServiceRoleId.refine((value) => value !== "", {
    message: "ロールを選択してください",
  }),
});

const ZRemoveMappingAction = ZMappingActionBase.extend({
  type: z.literal("remove"),
  targetServiceRoleId: ZServiceRoleId.refine((value) => value !== "", {
    message: "ロールを選択してください",
  }),
});

const ZInviteGroupMappingAction = ZMappingActionBase.extend({
  type: z.literal("invite-group"),
});

export const ZMappingAction = z.discriminatedUnion("type", [
  ZAddMappingAction,
  ZRemoveMappingAction,
  ZInviteGroupMappingAction,
]);

export type TAddMappingAction = z.infer<typeof ZAddMappingAction>;
export type TRemoveMappingAction = z.infer<typeof ZRemoveMappingAction>;
export type TRoleMappingAction = TAddMappingAction | TRemoveMappingAction;
export type TInviteGroupMappingAction = z.infer<
  typeof ZInviteGroupMappingAction
>;
export type TMappingAction = z.infer<typeof ZMappingAction>;

export const createNewMappingAction = (
  type: TMappingActionType,
): TMappingAction => {
  const base = {
    id: crypto.randomUUID() as TMappingActionId,
    targetServiceAccountId: "" as TExternalServiceAccountId, // バリデーションで必須チェック
    targetServiceGroupId: "" as TExternalServiceGroupId, // バリデーションで必須チェック
  };

  if (type === "invite-group") {
    return {
      ...base,
      type,
    } satisfies TInviteGroupMappingAction;
  }

  if (type === "add") {
    return {
      ...base,
      type,
      targetServiceRoleId: "" as TServiceRoleId, // バリデーションで必須チェック
    } satisfies TAddMappingAction;
  }

  return {
    ...base,
    type,
    targetServiceRoleId: "" as TServiceRoleId, // バリデーションで必須チェック
  } satisfies TRemoveMappingAction;
};
