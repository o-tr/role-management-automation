import { z } from "zod";

export const ZDiscordGuild = z.object({
  id: z.string(),
  name: z.string(),
  icon: z.string().optional(),
});
export type DiscordGuild = z.infer<typeof ZDiscordGuild>;

export const ZDiscordGuildRole = z.object({
  id: z.string(),
  name: z.string(),
  color: z.number(),
  icon: z.string().nullable(),
});
export type DiscordGuildRole = z.infer<typeof ZDiscordGuildRole>;

export const ZDiscordGuildMember = z.object({
  user: z.object({
    id: z.string(),
    username: z.string(),
    avatar: z.string().nullable(),
  }),
});
