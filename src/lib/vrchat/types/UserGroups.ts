import { z } from "zod";
import { ZVRCGroupId } from "./brand";

export const ZVRCUserGroup = z.object({
  groupId: ZVRCGroupId,
  iconUrl: z.string().optional(),
  name: z.string(),
})

export const ZVRCUserGroups = z.array(ZVRCUserGroup);
