import { z } from "zod";

export const ZVRCAuthUser = z.object({
  requiresTwoFactorAuth: z.array(z.string()),
});
