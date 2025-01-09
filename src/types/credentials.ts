import { z } from "zod";

export const ZDiscordCredentials = z.object({
  token: z.string(),
});

export const ZVRChatCredentials = z.object({
  username: z.string(),
  password: z.string(),
  totp: z.string(),
});

export const ZGithubCredentials = z.object({
  token: z.string(),
});

export type DiscordCredentials = z.infer<typeof ZDiscordCredentials>;
export type VRChatCredentials = z.infer<typeof ZVRChatCredentials>;
export type GithubCredentials = z.infer<typeof ZGithubCredentials>;
