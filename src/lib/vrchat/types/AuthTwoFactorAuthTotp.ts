import { z } from "zod";

export const ZVRCAuthTwoFactorAuthTotp = z.object({
  verified: z.boolean(),
});
