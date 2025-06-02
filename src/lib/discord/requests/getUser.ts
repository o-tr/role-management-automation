import { requests } from "@/lib/requests";
import { discordLimit } from "../plimit";
import type { DiscordToken } from "../types/token";
import { type DiscordUserId, ZDiscordUser } from "../types/user";

export const getUser = async (token: DiscordToken, userId: DiscordUserId) => {
  const response = await discordLimit(() =>
    requests(`https://discord.com/api/v10/users/${userId}`, {
      headers: {
        Authorization: `Bot ${token}`,
      },
    }),
  );
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`User not found: ${response.statusText}`);
    }
    throw new Error(`Failed to get user: ${response.statusText}`);
  }
  const data = ZDiscordUser.safeParse(await response.json());
  if (!data.success) {
    throw new Error(`Failed to parse guild: ${data.error}`);
  }
  return data.data;
};
