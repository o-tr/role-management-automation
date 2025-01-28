import { discordLimit } from "../plimit";
import type { DiscordToken } from "../types/token";
import { type DiscordUserId, ZDiscordUser } from "../types/user";

export const getUser = async (token: DiscordToken, userId: DiscordUserId) => {
  const response = await discordLimit(() =>
    fetch(`https://discord.com/api/v10/users/${userId}`, {
      headers: {
        Authorization: `Bot ${token}`,
      },
    }),
  );
  if (!response.ok) {
    throw new Error(`Failed to get guild: ${response.statusText}`);
  }
  const data = ZDiscordUser.safeParse(await response.json());
  if (!data.success) {
    throw new Error(`Failed to parse guild: ${data.error}`);
  }
  return data.data;
};
