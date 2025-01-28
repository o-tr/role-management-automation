import { z } from "zod";
import { ZVRCGroupMember } from "./GroupMember";
import { ZVRCGroupId } from "./brand";

export const ZVRCGroup = z.object({
  id: ZVRCGroupId,
  name: z.string(),
  iconUrl: z.string().optional(),
  myMember: ZVRCGroupMember.omit({ user: true }),
});
