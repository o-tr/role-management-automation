import { z } from "zod";

export const ZDiscordApplicaton = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  verify_key: z.string(),
  flags: z.number(),
  redirect_uris: z.array(z.string()),
});

export const ZDiscordGuild = z.object({
  id: z.string(),
  name: z.string(),
  icon: z.string().nullable(),
  banner: z.string().nullable(),
});

export const ZDiscordGuildList = z.array(ZDiscordGuild);
