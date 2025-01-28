import { z } from "zod";

export const ZDiscordToken = z.string().brand<"DiscordToken">("DiscordToken");
export type DiscordToken = z.infer<typeof ZDiscordToken>;
