import { z } from "zod";

export const ZDiscordUser = z.object({
  id: z.string(),
  username: z.string(),
  global_name: z.string(),
  discriminator: z.string(),
  avatar: z.string().nullable(),
});
