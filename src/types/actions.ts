import { z } from "zod";
import { ZServiceRoleId } from "./prisma";

export const ZMappingActionType = z.union([
  z.literal("add"),
  z.literal("remove"),
]);

export const ZMappingAction = z.object({
  type: ZMappingActionType,
  target: ZServiceRoleId,
});

export type TMappingAction = z.infer<typeof ZMappingAction>;
