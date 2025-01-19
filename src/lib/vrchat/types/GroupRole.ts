import { z } from "zod";
import { ZVRCGroupId, ZVRCGroupRoleId } from "./brand";

export const ZVRCGroupRole = z.object({
  id: ZVRCGroupRoleId,
  groupId: ZVRCGroupId,
  name: z.string(),
});
export type VRCGroupRole = z.infer<typeof ZVRCGroupRole>;
