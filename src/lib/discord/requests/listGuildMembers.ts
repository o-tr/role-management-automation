import { filterObject } from "@/lib/filterObject";
import { requests } from "@/lib/requests";
import { z } from "zod";
import { discordLimit } from "../plimit";
import { type DiscordGuildId, ZDiscordGuildMember } from "../types/guild";
import type { DiscordToken } from "../types/token";

type Options = {
  limit?: number;
  after?: number;
};

export const listGuildMembers = async (
  token: DiscordToken,
  guildId: DiscordGuildId,
  options: Options = {},
) => {
  const query = new URLSearchParams(
    filterObject({
      limit: options.limit?.toString(),
      after: options.after?.toString(),
    } as Record<string, string>),
  );
  const response = await discordLimit(() =>
    requests(
      `https://discord.com/api/v10/guilds/${guildId}/members?${query.toString()}`,
      {
        headers: {
          Authorization: `Bot ${token}`,
        },
      },
    ),
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch self application: ${response.statusText}`);
  }
  const data = z.array(ZDiscordGuildMember).safeParse(await response.json());
  if (!data.success) {
    throw new Error(
      `Failed to parse self application: ${JSON.stringify(data.error)}`,
    );
  }
  return data.data;
};
