import { requests } from "@/lib/requests";
import { z } from "zod";
import { discordLimit } from "../plimit";
import { type DiscordGuildId, ZDiscordGuildMember } from "../types/guild";
import type { DiscordToken } from "../types/token";

export const getSearchGuildMembers = async (
  token: DiscordToken,
  guildId: DiscordGuildId,
  query: string,
) => {
  const response = await discordLimit(() =>
    requests(
      `https://discord.com/api/v10/guilds/${guildId}/members/search?limit=1&query=${query}`,
      {
        headers: {
          Authorization: `Bot ${token}`,
        },
      },
    ),
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
