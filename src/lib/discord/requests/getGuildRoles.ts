import { z } from "zod";
import { discordLimit } from "../plimit";
import { ZDiscordGuildRole } from "../types/guild";

export const getGuildRoles = async (token: string, guildId: string) => {
  const response = await discordLimit(() =>
    fetch(`https://discord.com/api/v10/guilds/${guildId}/roles`, {
      headers: {
        Authorization: `Bot ${token}`,
      },
    }),
  );
  if (!response.ok) {
    throw new Error(`Failed to get guild: ${response.statusText}`);
  }
  const data = z.array(ZDiscordGuildRole).safeParse(await response.json());
  if (!data.success) {
    throw new Error(`Failed to parse guild roles: ${data.error}`);
  }
  return data.data;
};
