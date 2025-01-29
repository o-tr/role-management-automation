import { requests } from "@/lib/requests";
import { discordLimit } from "../plimit";
import { type DiscordGuildId, ZDiscordGuild } from "../types/guild";
import type { DiscordToken } from "../types/token";

export const getGuild = async (
  token: DiscordToken,
  guildId: DiscordGuildId,
) => {
  const response = await discordLimit(() =>
    requests(`https://discord.com/api/v10/guilds/${guildId}`, {
      headers: {
        Authorization: `Bot ${token}`,
      },
    }),
  );
  if (!response.ok) {
    throw new Error(`Failed to get guild: ${response.statusText}`);
  }
  const data = ZDiscordGuild.safeParse(await response.json());
  if (!data.success) {
    throw new Error(`Failed to parse guild: ${data.error}`);
  }
  return data.data;
};
