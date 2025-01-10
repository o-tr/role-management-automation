import { z } from "zod";
import { ZVRCToken } from "./brand";

export const ZVRCAuth = z.object({
  ok: z.boolean(),
  token: ZVRCToken,
});

export type VRCAuth = z.infer<typeof ZVRCAuth>;
