import { z } from "zod";

export const ZDiscordGuild = z.object({
  id: z.string(),
  name: z.string(),
  icon: z.string().optional(),
});
export type DiscordGuild = z.infer<typeof ZDiscordGuild>;
