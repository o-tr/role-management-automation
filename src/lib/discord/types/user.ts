import { z } from "zod";

export const ZDiscordUserId = z.string().brand("DiscordUserId");
export type DiscordUserId = z.infer<typeof ZDiscordUserId>;

export const ZDiscordUsername = z.string().brand("DiscordUsername");
export type DiscordUsername = z.infer<typeof ZDiscordUsername>;

export const ZDiscordUser = z.object({
  id: z.string(),
  username: ZDiscordUsername,
  global_name: z.string().nullable(),
  discriminator: z.string(),
  avatar: z.string().nullable(),
});
