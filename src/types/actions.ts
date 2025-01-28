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
]);
export type TMappingActionType = z.infer<typeof ZMappingActionType>;
export const ZMappingActions = ["add", "remove"] as const;

export const ZMappingAction = z.object({
  id: ZMappingActionId,
  type: ZMappingActionType,
  targetServiceAccountId: ZExternalServiceAccountId,
  targetServiceGroupId: ZExternalServiceGroupId,
  targetServiceRoleId: ZServiceRoleId,
});

export type TMappingAction = z.infer<typeof ZMappingAction>;

export const createNewMappingAction = (
  type: TMappingActionType,
): TMappingAction => {
  return {
    id: crypto.randomUUID() as TMappingActionId,
    type,
    targetServiceAccountId: "" as TExternalServiceAccountId,
    targetServiceGroupId: "" as TExternalServiceGroupId,
    targetServiceRoleId: "" as TServiceRoleId,
  };
};
