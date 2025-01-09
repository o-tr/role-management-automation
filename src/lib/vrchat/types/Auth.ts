import { z } from "zod";

export const ZVRCAuth = z.object({
  ok: z.boolean(),
  token: z.string(),
});

export type VRCAuth = z.infer<typeof ZVRCAuth>;
