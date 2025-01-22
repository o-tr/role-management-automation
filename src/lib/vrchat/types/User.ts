import { z } from "zod";

export const ZVRCUser = z.object({
  currentAvatarImageUrl: z.string(),
  currentAvatarThumbnailImageUrl: z.string(),
  profilePicOverride: z.string(),
  profilePicOverrideThumbnail: z.string(),
  displayName: z.string(),
});
