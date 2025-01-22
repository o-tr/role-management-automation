import { z } from "zod";
import { ZDiscordGuildMember } from "../types/guild";

export const getSearchGuildMembers = async (
  token: string,
  guildId: string,
  query: string,
) => {
  const response = await fetch(
    `https://discord.com/api/v10/guilds/${guildId}/members/search?limit=1&query=${query}`,
    {
      headers: {
        Authorization: `Bot ${token}`,
      },
    },
  );
  if (!response.ok) {
    console.error(await response.text());
    throw new Error(`Failed to get guild: ${response.statusText}`);
  }
  const data = z.array(ZDiscordGuildMember).safeParse(await response.json());
  if (!data.success) {
    throw new Error(`Failed to parse guild: ${data.error}`);
  }
  return data.data;
};
