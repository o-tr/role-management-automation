import { requests } from "@/lib/requests";
import { discordLimit } from "../plimit";
import { ZDiscordGuildList } from "../types/application";
import type { DiscordToken } from "../types/token";

export const getBelongGuilds = async (token: DiscordToken) => {
  const response = await discordLimit(() =>
    requests("https://discord.com/api/v10/users/@me/guilds", {
      headers: {
        Authorization: `Bot ${token}`,
      },
    }),
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch self application: ${response.statusText}`);
  }
  const data = ZDiscordGuildList.safeParse(await response.json());
  if (!data.success) {
    throw new Error(
      `Failed to parse self application: ${JSON.stringify(data.error)}`,
    );
  }
  return data.data;
};
