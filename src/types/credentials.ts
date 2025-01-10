import { ZVRCToken, ZVRCTwoFactorAuth, ZVRCUserId } from "@/lib/vrchat/types/brand";
import { z } from "zod";

export const ZDiscordCredentials = z.object({
  token: z.string(),
});
export type DiscordCredentials = z.infer<typeof ZDiscordCredentials>;

export const ZVRChatCredentialsInput = z.object({
  username: z.string(),
  password: z.string(),
  totp: z.string(),
});
export type VRChatCredentialsInput = z.infer<typeof ZVRChatCredentialsInput>;

export const ZVRChatCredentials = z.object({
  username: z.string(),
  password: z.string(),
  totp: z.string(),
  token: ZVRCToken,
  twoFactorToken: ZVRCTwoFactorAuth,
  userId: ZVRCUserId,
});
export type VRChatCredentials = z.infer<typeof ZVRChatCredentials>;

export const ZGithubCredentials = z.object({
  token: z.string(),
});
export type GithubCredentials = z.infer<typeof ZGithubCredentials>;

