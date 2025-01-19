import { z } from "zod";
import { type TServiceRoleId, ZServiceRoleId } from "./prisma";

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
  targetServiceAccountId: z.string().uuid(),
  targetServiceGroupId: z.string().uuid(),
  targetServiceRoleId: ZServiceRoleId,
});

export type TMappingAction = z.infer<typeof ZMappingAction>;

export const createNewMappingAction = (
  type: TMappingActionType,
): TMappingAction => {
  return {
    id: crypto.randomUUID() as TMappingActionId,
    type,
    targetServiceAccountId: "",
    targetServiceGroupId: "",
    targetServiceRoleId: "" as TServiceRoleId,
  };
};
