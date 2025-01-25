import { discordLimit } from "../plimit";
import { ZDiscordGuild } from "../types/guild";

export const getGuild = async (token: string, guildId: string) => {
  const response = await discordLimit(() =>
    fetch(`https://discord.com/api/v10/guilds/${guildId}`, {
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
