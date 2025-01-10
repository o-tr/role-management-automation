import { z } from "zod";
import { ZVRCGroupId } from "./brand";

export const ZVRCGroup = z.object({
  id: ZVRCGroupId,
  name: z.string(),
  iconUrl: z.string().optional(),
});
