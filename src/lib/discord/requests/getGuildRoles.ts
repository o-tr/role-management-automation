import { requests } from "@/lib/requests";
import { z } from "zod";
import { discordLimit } from "../plimit";
import { type DiscordGuildId, ZDiscordGuildRole } from "../types/guild";
import type { DiscordToken } from "../types/token";

export const getGuildRoles = async (
  token: DiscordToken,
  guildId: DiscordGuildId,
) => {
  const response = await discordLimit(() =>
    requests(`https://discord.com/api/v10/guilds/${guildId}/roles`, {
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
