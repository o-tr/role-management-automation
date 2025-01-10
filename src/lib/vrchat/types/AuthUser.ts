import { z } from "zod";
import { ZVRCUserId } from "./brand";

export const ZVRCAuthUserWithAuth = z.object({
  requiresTwoFactorAuth: z.array(z.string()),
});
export type VRCAuthUserWithAuth = z.infer<typeof ZVRCAuthUserWithAuth>;

export const ZVRCAuthUser = z.object({
  id: ZVRCUserId,
  currentAvatarThumbnailImageUrl: z.string(),
});
export type VRCAuthUser = z.infer<typeof ZVRCAuthUser>;
