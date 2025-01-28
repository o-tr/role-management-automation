import { z } from "zod";

export const ZDiscordGuildId = z
  .string()
  .brand<"DiscordGuildId">("DiscordGuildId");
export type DiscordGuildId = z.infer<typeof ZDiscordGuildId>;
export const ZDiscordGuild = z.object({
  id: ZDiscordGuildId,
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
    global_name: z.string().nullable(),
    avatar: z.string().nullable(),
  }),
  roles: z.array(z.string()),
});
export type DiscordGuildMember = z.infer<typeof ZDiscordGuildMember>;
