import { z } from "zod";
import { ZVRCGroupId } from "./brand";
import { ZVRCGroupMember } from "./GroupMember";

export const ZVRCGroup = z.object({
  id: ZVRCGroupId,
  name: z.string(),
  iconUrl: z.string().optional(),
  myMember: ZVRCGroupMember.omit({ user: true }),
  memberCount: z.number().optional(),
});
